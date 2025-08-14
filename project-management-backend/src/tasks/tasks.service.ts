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

@Injectable()
export class TasksService {
  // <-- ক্লাসের শুরু

  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
  ) {}

  // মেথড ১
  async findTasksForUser(user: User): Promise<Task[]> {
    if (
      user.role === UserRole.ADMIN ||
      user.role === UserRole.PROJECT_MANAGER
    ) {
      return this.tasksRepository.find({ relations: ['assignee'] });
    } else {
      return this.tasksRepository.find({
        where: { assignee: { id: user.id } },
        relations: ['assignee'],
      });
    }
  }

  // মেথড ২
  async create(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const newTask = this.tasksRepository.create({
      ...createTaskDto,
      assignee: user,
    });
    return this.tasksRepository.save(newTask);
  }

  // মেথড ৩
  async updateStatus(
    id: string,
    status: TaskStatus,
    user: User,
  ): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: ['assignee'],
    });

    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
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

    task.status = status;
    return this.tasksRepository.save(task);
  }

  // এখানে ভবিষ্যতে update, remove মেথড যোগ হবে
} // <-- ক্লাসের শেষ
