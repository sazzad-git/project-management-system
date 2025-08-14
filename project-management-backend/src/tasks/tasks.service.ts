import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus } from './entities/task.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskActivity } from './entities/task-activity.entity'; // ১. TaskActivity ইম্পোর্ট করুন

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    // ২. TaskActivity Repository ইনজেক্ট করুন
    @InjectRepository(TaskActivity)
    private activityRepository: Repository<TaskActivity>,
  ) {}

  // findTasksForUser মেথড (অপরিবর্তিত)
  async findTasksForUser(user: User): Promise<Task[]> {
    if (
      user.role === UserRole.ADMIN ||
      user.role === UserRole.PROJECT_MANAGER
    ) {
      return this.tasksRepository.find({
        relations: ['assignee', 'activities.user'],
      });
    } else {
      return this.tasksRepository.find({
        where: { assignee: { id: user.id } },
        relations: ['assignee', 'activities.user'],
      });
    }
  }

  // create মেথড (অপরিবর্তিত)
  async create(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const newTask = this.tasksRepository.create({
      ...createTaskDto,
      assignee: user,
    });
    return this.tasksRepository.save(newTask);
  }

  // --- updateStatus মেথডটি এখানে আপডেট করা হয়েছে ---
  async updateStatus(
    id: string,
    newStatus: TaskStatus,
    user: User,
  ): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: ['assignee'],
    });

    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    const oldStatus = task.status;

    if (oldStatus === newStatus) {
      return task;
    }

    const canUpdate =
      user.role === UserRole.ADMIN ||
      user.role === UserRole.PROJECT_MANAGER ||
      task.assignee?.id === user.id;

    if (!canUpdate) {
      throw new UnauthorizedException(
        'You are not authorized to update this task status',
      );
    }

    task.status = newStatus;

    const description = `${user.name} changed status from "${this.formatStatus(
      oldStatus,
    )}" to "${this.formatStatus(newStatus)}"`;

    const newActivity = this.activityRepository.create({
      description,
      user,
      task,
    });

    await this.activityRepository.save(newActivity);

    // --- সমাধানটি এখানে ---
    // টাস্কটি আবার লোড করার পরিবর্তে, আমরা বিদ্যমান task অবজেক্টটিকেই সেভ করব
    // এবং তারপর সেটিকে নতুন অ্যাক্টিভিটি সহ আবার fetch করব।
    await this.tasksRepository.save(task);

    const reloadedTask = await this.tasksRepository.findOne({
      where: { id },
      relations: ['assignee', 'activities', 'activities.user'],
    });

    // যদি কোনো কারণে টাস্কটি রিলোড না হয়, তাহলে এরর থ্রো করুন
    if (!reloadedTask) {
      throw new NotFoundException('Could not find the task after updating it.');
    }

    // এখন reloadedTask নিশ্চিতভাবে একটি Task, null নয়
    return reloadedTask;
  }

  private formatStatus(status: TaskStatus): string {
    return status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  }
}
