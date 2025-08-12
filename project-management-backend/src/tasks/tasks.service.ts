// src/tasks/tasks.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
// import { CreateTaskDto } from './dto/create-task.dto'; // পরে ব্যবহার হবে

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
  ) {}

  // এই মেথডটি নিশ্চিত করুন যে এটি find() ব্যবহার করছে
  async findAll(): Promise<Task[]> {
    // this.tasksRepository.find() সবসময় একটি অ্যারে রিটার্ন করে
    // যদি কোনো টাস্ক না থাকে, তবে এটি একটি খালি অ্যারে ([]) রিটার্ন করবে
    return this.tasksRepository.find();
  }

  // এখানে create, findOne, update, remove মেথডগুলো পরে যোগ হবে...
}