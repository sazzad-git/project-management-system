import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Task } from '../../tasks/entities/task.entity';

export enum UserRole {
  ADMIN = 'admin',
  PROJECT_MANAGER = 'project_manager',
  DEVELOPER = 'developer',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  role: UserRole;
  @Column({ type: 'varchar', length: 100, nullable: true })
  jobTitle: string;

  @Column({ type: 'varchar', nullable: true })
  passwordResetToken: string | null;

  @Column({ type: 'timestamp', nullable: true })
  passwordResetExpires: Date | null;

  @Column({ type: 'text', nullable: true })
  profileImage: string;

  @ManyToMany(() => Task, (task) => task.assignees)
  tasks: Task[];
}
