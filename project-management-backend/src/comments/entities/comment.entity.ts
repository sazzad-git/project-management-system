import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Task } from '../../tasks/entities/task.entity';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  text: string; // কমেন্টের মূল লেখা

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, { eager: true }) // কোন ইউজার কমেন্টটি করেছে
  user: User;

  @ManyToOne(() => Task, (task) => task.comments, { onDelete: 'CASCADE' }) // কোন টাস্কের উপর কমেন্টটি হয়েছে
  task: Task;
}
