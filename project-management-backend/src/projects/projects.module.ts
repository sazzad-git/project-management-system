import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { User } from '../users/entities/user.entity'; // User এনটিটি ইম্পোর্ট করুন
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { TasksModule } from '../tasks/tasks.module'; // ১. TasksModule ইম্পোর্ট করুন

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, User]),
    TasksModule, // এখন TypeOrmModule, Project, এবং User-কে চিনতে পারবে
  ],
  controllers: [ProjectsController], // এখন ProjectsController-কে চিনতে পারবে
  providers: [ProjectsService], // এখন ProjectsService-কে চিনতে পারবে
  exports: [ProjectsService], // অন্য মডিউলে ব্যবহারের জন্য ProjectsService এক্সপোর্ট করা হচ্ছে
})
export class ProjectsModule {}
