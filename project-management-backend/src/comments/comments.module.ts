import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { Task } from '../tasks/entities/task.entity';
import { User } from '../users/entities/user.entity';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, Task, User]), // এখন TypeOrmModule, Comment, Task, এবং User-কে চিনতে পারবে
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
