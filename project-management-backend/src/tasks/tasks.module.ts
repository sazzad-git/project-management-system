// src/tasks/tasks.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TaskActivity } from './entities/task-activity.entity';
import { User } from '../users/entities/user.entity';
import { Project } from '../projects/entities/project.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, TaskActivity, User, Project]), // Task Repository রেজিস্টার করার জন্য
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService], // <-- এই লাইনটি যোগ করুন
})
export class TasksModule {}
