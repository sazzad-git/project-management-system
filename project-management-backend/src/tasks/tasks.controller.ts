// src/tasks/tasks.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  // নিশ্চিত করুন যে GET রিকোয়েস্টটি findAll() মেথডকে কল করছে
  @Get()
  findAll() {
    return this.tasksService.findAll();
  }

  // POST এবং অন্যান্য মেথডগুলো এখানে থাকবে
  // @Post() ...
}