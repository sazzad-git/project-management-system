import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { Task } from '../tasks/entities/task.entity';
import { User } from '../users/entities/user.entity';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
  ) {}

  async create(
    taskId: string,
    createCommentDto: CreateCommentDto,
    user: User,
  ): Promise<Comment> {
    const task = await this.tasksRepository.findOneBy({ id: taskId });
    if (!task) {
      throw new NotFoundException(`Task with ID "${taskId}" not found`);
    }

    const newComment = this.commentsRepository.create({
      ...createCommentDto,
      user,
      task,
    });

    return this.commentsRepository.save(newComment);
  }

  async findAllForTask(taskId: string): Promise<Comment[]> {
    return this.commentsRepository.find({
      where: { task: { id: taskId } },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });
  }
}
