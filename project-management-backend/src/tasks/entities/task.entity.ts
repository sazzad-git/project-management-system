import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { TaskActivity } from './task-activity.entity';
import { Project } from '../../projects/entities/project.entity';
import { Comment } from '../../comments/entities/comment.entity'; // Comment ইম্পোর্ট করুন

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
    onDelete: 'CASCADE', // এই অপশনটি যোগ করুন
  })
  activities: TaskActivity[];
  @Column({ type: 'enum', enum: TaskPriority, default: TaskPriority.MEDIUM })
  priority: TaskPriority;
  // --- নতুন: creator সম্পর্কটি এখানে যোগ করুন ---
  @ManyToOne(() => User, { eager: true }) // eager: true দিলে টাস্ক লোড করার সময় creator-ও চলে আসবে
  creator: User;
  @Column({ type: 'timestamp', nullable: true })
  dueDate: Date;
  @ManyToOne(() => User, { eager: true })
  assignee: User;
  @Column('uuid', { array: true, nullable: true })
  dependencies: string[];

  @ManyToOne(() => Project, (project) => project.tasks, { onDelete: 'CASCADE' })
  project: Project;

  @ManyToMany(() => User, { eager: true }) // eager: true দিলে টাস্ক লোড করার সময় assignees-ও চলে আসবে
  @JoinTable() // TypeORM-কে একটি জয়েন টেবিল (task_assignees_user) তৈরি করতে বলে
  assignees: User[]; // এখন এটি একটি User অ্যারে

  @OneToMany(() => Comment, (comment) => comment.task, {
    eager: true,
    cascade: true,
  })
  comments: Comment[]; // এই টাস্কের অধীনে থাকা কমেন্টগুলো
}
