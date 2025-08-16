import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Task } from '../../tasks/entities/task.entity';

@Entity()
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, { eager: true })
  creator: User;

  @ManyToMany(() => User, { eager: true })
  @JoinTable()
  members: User[];

  @OneToMany(() => Task, (task) => task.project)
  tasks: Task[];
}
