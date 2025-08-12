import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
  ) {}

  // টাস্ক তৈরির জন্য create মেথড
  async create(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const newTask = this.tasksRepository.create({
      ...createTaskDto,
      assignee: user, // লগইন করা ইউজারকে টাস্কের assignee হিসেবে সেট করা
    });
    return this.tasksRepository.save(newTask);
  }

  // সকল টাস্ক পাওয়ার জন্য findAll মেথড
  async findAll(): Promise<Task[]> {
    return this.tasksRepository.find({ relations: ['assignee'] });
  }
}