// src/tasks/tasks.module.ts

import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TaskActivity } from './entities/task-activity.entity';
import { User } from '../users/entities/user.entity';
import { Project } from '../projects/entities/project.entity';
import { EventsModule } from '../events/events.module'; // ১. EventsModule ইম্পোর্ট করুন

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, TaskActivity, User, Project, EventsModule]), // Task Repository রেজিস্টার করার জন্য
    forwardRef(() => EventsModule),
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService], // <-- এই লাইনটি যোগ করুন
})
export class TasksModule {}
