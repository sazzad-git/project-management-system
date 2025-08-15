import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DataSource } from 'typeorm';
import { Task, TaskStatus } from './entities/task.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskActivity } from './entities/task-activity.entity';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Project } from '../projects/entities/project.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(TaskActivity)
    private activityRepository: Repository<TaskActivity>,
    private dataSource: DataSource, // ১. DataSource ইনজেক্ট করুন

    @InjectRepository(Project) // Project Repository ইনজেক্ট করুন
    private projectsRepository: Repository<Project>,
  ) {}

  // findTasksForUser মেথড (এরর সমাধান করা হয়েছে)
  async findTasksForUser(user: User): Promise<Task[]> {
    const relations = ['assignees', 'creator', 'activities', 'activities.user'];

    if (
      user.role === UserRole.ADMIN ||
      user.role === UserRole.PROJECT_MANAGER
    ) {
      return this.tasksRepository.find({
        relations,
        order: { createdAt: 'DESC' },
      });
    }

    // Developer-এর জন্য QueryBuilder ব্যবহার করা হচ্ছে
    return this.tasksRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.assignees', 'assignee')
      .leftJoinAndSelect('task.creator', 'creator')
      .leftJoinAndSelect('task.activities', 'activity')
      .leftJoinAndSelect('activity.user', 'activityUser')
      .where('assignee.id = :userId', { userId: user.id })
      .orderBy('task.createdAt', 'DESC')
      .getMany();
  }

  // --- শুধুমাত্র একটি create মেথড থাকবে ---
  async create(createTaskDto: CreateTaskDto, creator: User): Promise<Task> {
    if (
      creator.role !== UserRole.ADMIN &&
      creator.role !== UserRole.PROJECT_MANAGER
    ) {
      throw new UnauthorizedException(
        'Only Admins and Project Managers can create tasks.',
      );
    }

    const { assigneeIds, projectId, ...taskData } = createTaskDto;

    const project = await this.projectsRepository.findOneBy({ id: projectId });
    if (!project) {
      throw new NotFoundException(`Project with ID "${projectId}" not found`);
    }

    let assignees: User[] = [];
    if (assigneeIds && assigneeIds.length > 0) {
      assignees = await this.usersRepository.findBy({ id: In(assigneeIds) });
    }

    const newTask = this.tasksRepository.create({
      ...taskData,
      assignees,
      creator,
      project,
    });

    const savedTask = await this.tasksRepository.save(newTask);

    const creationActivity = this.activityRepository.create({
      description: `${creator.name} created the task "${savedTask.title}"`,
      user: creator,
      task: savedTask,
    });
    await this.activityRepository.save(creationActivity);

    const reloadedTask = await this.tasksRepository.findOne({
      where: { id: savedTask.id },
      relations: [
        'assignees',
        'creator',
        'project',
        'activities',
        'activities.user',
      ],
    });

    if (!reloadedTask) {
      throw new NotFoundException('Could not reload task after creation.');
    }
    return reloadedTask;
  }

  // updateStatus মেথড (এরর সমাধান করা হয়েছে)
  async updateStatus(
    id: string,
    newStatus: TaskStatus,
    user: User,
  ): Promise<Task> {
    try {
      // --- পরিবর্তনটি এখানে: findOne-এর পরিবর্তে findOneOrFail ব্যবহার করুন ---
      const task = await this.tasksRepository.findOneOrFail({
        where: { id },
        relations: ['assignees', 'creator'],
      });

      const isAssignedDeveloper =
        user.role === UserRole.DEVELOPER &&
        task.assignees.some((a) => a.id === user.id);
      const isCreatorPM =
        user.role === UserRole.PROJECT_MANAGER && task.creator.id === user.id;

      if (
        user.role !== UserRole.ADMIN &&
        !isCreatorPM &&
        !isAssignedDeveloper
      ) {
        throw new UnauthorizedException(
          'You do not have permission to update this task status',
        );
      }

      const oldStatus = task.status;
      if (oldStatus === newStatus) return task;

      task.status = newStatus;
      await this.tasksRepository.save(task);

      const description = `${user.name} changed status from "${this.formatStatus(oldStatus)}" to "${this.formatStatus(newStatus)}"`;
      const newActivity = this.activityRepository.create({
        description,
        user,
        task,
      });
      await this.activityRepository.save(newActivity);

      const reloadedTask = await this.tasksRepository.findOne({
        where: { id },
        relations: ['assignees', 'creator', 'activities', 'activities.user'],
      });
      if (!reloadedTask) throw new NotFoundException('Could not reload task.'); // এই চেকটি এখনও ভালো
      return reloadedTask;
    } catch (error) {
      if (error.name === 'EntityNotFoundError') {
        throw new NotFoundException(`Task with ID "${id}" not found`);
      }
      throw error; // অন্যান্য এরর (যেমন UnauthorizedException) আবার থ্রো করুন
    }
  }

  async update(
    id: string,
    updateTaskDto: UpdateTaskDto,
    user: User,
  ): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: ['creator', 'assignees'],
    });
    if (!task) {
      throw new NotFoundException(`Task not found`);
    }

    // পারমিশন চেক: শুধুমাত্র Admin, স্রষ্টা PM, বা অ্যাসাইন করা সদস্যরাই এডিট করতে পারবে
    const canUpdate =
      user.role === UserRole.ADMIN ||
      (user.role === UserRole.PROJECT_MANAGER && task.creator.id === user.id) ||
      task.assignees.some((assignee) => assignee.id === user.id);

    if (!canUpdate) {
      throw new UnauthorizedException(
        'You do not have permission to edit this task',
      );
    }

    const { assigneeIds, ...taskDetails } = updateTaskDto;

    // Title এবং Description আপডেট করুন
    Object.assign(task, taskDetails);

    // Assignees আপডেট করুন (যদি পাঠানো হয়)
    if (assigneeIds) {
      const newAssignees = await this.usersRepository.findBy({
        id: In(assigneeIds),
      });
      task.assignees = newAssignees;
    }

    const updatedTask = await this.tasksRepository.save(task);

    // অ্যাক্টিভিটি লগ
    const activity = this.activityRepository.create({
      description: `${user.name} updated the task details.`,
      user,
      task: updatedTask,
    });
    await this.activityRepository.save(activity);

    // সম্পূর্ণ তথ্যসহ রিটার্ন করুন
    return this.tasksRepository.findOneOrFail({
      where: { id },
      relations: ['creator', 'assignees', 'activities', 'activities.user'],
    });
  }

  // remove মেথড (চূড়ান্ত সমাধান - Transaction সহ)
  async remove(id: string, user: User): Promise<{ message: string }> {
    // ২. একটি Query Runner তৈরি করুন
    const queryRunner = this.dataSource.createQueryRunner();

    // ৩. ডেটাবেস কানেকশন স্থাপন করুন এবং ট্রানজ্যাকশন শুরু করুন
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // ট্রানজ্যাকশনের মধ্যে Repository ব্যবহার করার জন্য
      const taskRepo = queryRunner.manager.getRepository(Task);
      const activityRepo = queryRunner.manager.getRepository(TaskActivity);

      // ৪. টাস্কটি খুঁজুন এবং পারমিশন চেক করুন
      const task = await taskRepo.findOne({
        where: { id },
        relations: ['creator', 'assignees', 'activities'],
      });

      if (!task) {
        throw new NotFoundException(`Task with ID "${id}" not found`);
      }

      const isCreatorPM =
        user.role === UserRole.PROJECT_MANAGER && task.creator.id === user.id;

      if (user.role !== UserRole.ADMIN && !isCreatorPM) {
        throw new UnauthorizedException(
          'Only Admins or the creating Project Manager can delete this task',
        );
      }

      // ৫. প্রথমে সম্পর্কিত সব অ্যাক্টিভিটি ডিলিট করুন
      if (task.activities && task.activities.length > 0) {
        await activityRepo.remove(task.activities);
      }

      // ৬. এরপর Many-to-Many রিলেশনশিপ পরিষ্কার করুন (জয়েন টেবিল থেকে এন্ট্রি মুছে দিন)
      await queryRunner.query(
        `DELETE FROM "task_assignees_user" WHERE "taskId" = $1`,
        [task.id],
      );

      // ৭. এখন মূল টাস্কটিকে ডিলিট করুন
      await taskRepo.remove(task);

      // ৮. যদি সবকিছু সফল হয়, ট্রানজ্যাকশনটি কমিট করুন
      await queryRunner.commitTransaction();

      return {
        message: 'Task and all related data have been deleted successfully.',
      };
    } catch (err) {
      // ৯. যদি কোনো এরর হয়, ট্রানজ্যাকশনটি রোলব্যাক করুন
      await queryRunner.rollbackTransaction();
      // এররটিকে আবার থ্রো করুন যাতে NestJS হ্যান্ডেল করতে পারে
      if (
        err instanceof NotFoundException ||
        err instanceof UnauthorizedException
      ) {
        throw err;
      }
      throw new Error(`Failed to delete task: ${err.message}`);
    } finally {
      // ১০. কানেকশনটি রিলিজ করুন
      await queryRunner.release();
    }
  }

  // --- এই নতুন মেথডটি যোগ করুন ---
  async findAllByProjectId(projectId: string, user: User): Promise<Task[]> {
    // এখানে আমরা একটি অতিরিক্ত পারমিশন চেক করতে পারি যে,
    // ব্যবহারকারীর এই প্রজেক্টটি দেখার অনুমতি আছে কিনা।
    // আপাতত, আমরা ধরে নিচ্ছি যে যদি সে ড্যাশবোর্ডে যেতে পারে, তাহলে অনুমতি আছে।

    const tasks = await this.tasksRepository.find({
      where: {
        project: {
          id: projectId,
        },
      },
      relations: ['assignees', 'creator', 'activities', 'activities.user'],
      order: { createdAt: 'DESC' },
    });

    // আপনি চাইলে এখানেও রোল অনুযায়ী ফিল্টার করতে পারেন
    if (user.role === UserRole.DEVELOPER) {
      return tasks.filter((task) =>
        task.assignees.some((a) => a.id === user.id),
      );
    }

    return tasks;
  }

  // formatStatus মেথড (অপরিবর্তিত)
  private formatStatus(status: TaskStatus): string {
    return status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  }
}
