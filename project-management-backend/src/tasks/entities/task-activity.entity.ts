import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Task } from './task.entity';

@Entity()
export class TaskActivity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  description: string; // যেমন: "Sazzad changed status from To Do to In Progress"

  @CreateDateColumn() // TypeORM স্বয়ংক্রিয়ভাবে তৈরির সময় সেট করবে
  createdAt: Date;

  @ManyToOne(() => User, { eager: true }) // কোন ইউজার পরিবর্তনটি করেছে
  user: User;

  @ManyToOne(() => Task, (task) => task.activities) // কোন টাস্কের উপর পরিবর্তনটি হয়েছে
  task: Task;
}
