import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { TaskActivity } from './task-activity.entity';

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
}
export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}
@Entity()
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  title: string;
  @Column('text')
  description: string;
  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.TODO,
  })
  status: TaskStatus;
  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  @CreateDateColumn() // টাস্কটি কখন তৈরি হয়েছে
  createdAt: Date;

  @UpdateDateColumn() // টাস্কটি শেষ কখন আপডেট হয়েছে
  updatedAt: Date;
  @OneToMany(() => TaskActivity, (activity) => activity.task, {
    eager: true,
    cascade: true,
  })
  activities: TaskActivity[];

  priority: TaskPriority;
  @Column({ type: 'timestamp', nullable: true })
  dueDate: Date;
  @ManyToOne(() => User, { eager: true })
  assignee: User;
  @Column('uuid', { array: true, nullable: true })
  dependencies: string[];
}
