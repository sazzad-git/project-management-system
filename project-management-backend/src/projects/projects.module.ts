import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { User } from '../users/entities/user.entity';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { TasksModule } from '../tasks/tasks.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, User]),
    TasksModule, // এখন TypeOrmModule, Project, এবং User-কে চিনতে পারবে
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
