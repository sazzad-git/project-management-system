import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DataSource } from 'typeorm';
import { Project } from './entities/project.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Task } from '../tasks/entities/task.entity';
import { TaskActivity } from '../tasks/entities/task-activity.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private dataSource: DataSource, // DataSource ইনজেক্ট করুন
  ) {}

  async create(
    createProjectDto: CreateProjectDto,
    creator: User,
  ): Promise<Project> {
    if (
      creator.role !== UserRole.ADMIN &&
      creator.role !== UserRole.PROJECT_MANAGER
    ) {
      throw new UnauthorizedException(
        'Only Admins and Project Managers can create projects.',
      );
    }

    const { memberIds, ...projectData } = createProjectDto;
    const members = await this.usersRepository.findBy({ id: In(memberIds) });

    const newProject = this.projectsRepository.create({
      ...projectData,
      creator,
      members: [...members, creator],
    });

    return this.projectsRepository.save(newProject);
  }

  async findAllForUser(user: User): Promise<Project[]> {
    if (user.role === UserRole.ADMIN) {
      return this.projectsRepository.find({
        relations: ['creator', 'members'],
      });
    }
    return this.projectsRepository
      .createQueryBuilder('project')
      .leftJoin('project.members', 'member')
      .where('member.id = :userId', { userId: user.id })
      .leftJoinAndSelect('project.creator', 'creator')
      .leftJoinAndSelect('project.members', 'all_members')
      .getMany();
  }

  // --- সমাধানটি এখানে: এই নতুন মেথডটি যোগ করুন ---
  async findOne(id: string, user: User): Promise<Project> {
    const project = await this.projectsRepository.findOne({
      where: { id },
      relations: ['creator', 'members', 'tasks'], // tasks-ও লোড করতে পারেন
    });

    if (!project) {
      throw new NotFoundException(`Project with ID "${id}" not found.`);
    }

    // পারমিশন চেক: ইউজার কি Admin অথবা এই প্রজেক্টের সদস্য?
    const isMember = project.members.some((member) => member.id === user.id);

    if (user.role !== UserRole.ADMIN && !isMember) {
      throw new UnauthorizedException(
        'You do not have permission to view this project.',
      );
    }

    return project;
  }

  // --- নতুন: update মেথড ---
  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
    user: User,
  ): Promise<Project> {
    const project = await this.projectsRepository.findOneBy({ id });
    if (!project) {
      throw new NotFoundException(`Project with ID "${id}" not found.`);
    }

    // পারমিশন চেক: শুধুমাত্র Admin অথবা প্রজেক্টের স্রষ্টা (Creator) প্রজেক্ট এডিট করতে পারবে
    if (user.role !== UserRole.ADMIN && project.creator.id !== user.id) {
      throw new UnauthorizedException(
        'You do not have permission to edit this project.',
      );
    }

    const { memberIds, ...projectDetails } = updateProjectDto;

    // নাম এবং ডেসক্রিপশন আপডেট করুন
    Object.assign(project, projectDetails);

    // মেম্বারদের তালিকা আপডেট করুন (যদি পাঠানো হয়)
    if (memberIds) {
      const newMembers = await this.usersRepository.findBy({
        id: In(memberIds),
      });
      project.members = newMembers;
    }

    return this.projectsRepository.save(project);
  }

  // remove মেথড (চূড়ান্ত সমাধান - Transaction সহ)
  async remove(id: string, user: User): Promise<{ message: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // ট্রানজ্যাকশনের মধ্যে Repository ব্যবহার করুন
      const projectRepo = queryRunner.manager.getRepository(Project);
      const taskRepo = queryRunner.manager.getRepository(Task);
      const activityRepo = queryRunner.manager.getRepository(TaskActivity);

      const project = await projectRepo.findOne({
        where: { id },
        relations: ['creator', 'tasks', 'tasks.activities'],
      });
      if (!project) {
        throw new NotFoundException(`Project with ID "${id}" not found.`);
      }

      // পারমিশন চেক
      if (user.role !== UserRole.ADMIN && project.creator.id !== user.id) {
        throw new UnauthorizedException(
          'You do not have permission to delete this project.',
        );
      }

      // ১. প্রথমে প্রতিটি টাস্কের সাথে সম্পর্কিত সব অ্যাক্টিভিটি ডিলিট করুন
      for (const task of project.tasks) {
        if (task.activities && task.activities.length > 0) {
          await activityRepo.remove(task.activities);
        }
      }

      // ২. এরপর প্রজেক্টের সাথে সম্পর্কিত সব টাস্ক ডিলিট করুন
      if (project.tasks && project.tasks.length > 0) {
        await taskRepo.remove(project.tasks);
      }

      // ৩. সবশেষে, মূল প্রজেক্টটিকে ডিলিট করুন
      await projectRepo.remove(project);

      await queryRunner.commitTransaction();

      return { message: 'Project and all related data deleted successfully.' };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      if (
        err instanceof NotFoundException ||
        err instanceof UnauthorizedException
      ) {
        throw err;
      }
      throw new Error(`Failed to delete project: ${err.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  async getGanttData(
    projectId: string,
    user: User,
  ): Promise<{ data: any[]; links: any[] }> {
    // প্রথমে প্রজেক্টটি খুঁজে বের করে পারমিশন চেক করুন
    await this.findOne(projectId, user);

    const project = await this.projectsRepository.findOne({
      where: { id: projectId },
      relations: ['tasks'],
    });

    if (!project) throw new NotFoundException('Project not found');

    const data = project.tasks
      .filter((task) => task.startDate && task.duration != null)
      .map((task) => ({
        id: task.id,
        text: task.title,
        start_date: task.startDate.toISOString().split('T')[0],
        duration: task.duration,
        progress: 0, // ডিফল্ট ভ্যালু
      }));

    const links: any[] = [];
    project.tasks.forEach((task) => {
      if (task.dependencies && task.dependencies.length > 0) {
        task.dependencies.forEach((depId) => {
          links.push({
            id: `${depId}-${task.id}`,
            source: depId,
            target: task.id,
            type: '0',
          });
        });
      }
    });

    return { data, links };
  }
}
