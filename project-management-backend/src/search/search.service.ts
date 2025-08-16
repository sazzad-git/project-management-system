import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Project } from '../projects/entities/project.entity';
import { Task } from '../tasks/entities/task.entity';
import { User, UserRole } from '../users/entities/user.entity'; // UserRole ইম্পোর্ট করুন

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
  ) {}

  async performSearch(
    query: string,
    user: User,
  ): Promise<{ projects: Project[]; tasks: Task[] }> {
    const searchQuery = `%${query.toLowerCase()}%`; // নির্ভরযোগ্য সার্চের জন্য toLowerCase ব্যবহার করুন

    // --- ১. প্রজেক্ট সার্চের জন্য কোয়েরি বিল্ডার ---
    const projectsQueryBuilder =
      this.projectsRepository.createQueryBuilder('project');

    // --- ADMIN রোলের জন্য নতুন লজিক ---
    if (user.role !== UserRole.ADMIN) {
      // যদি ইউজার Admin না হয়, তাহলেই শুধু মেম্বারশিপ চেক করুন
      projectsQueryBuilder
        .leftJoin('project.members', 'member')
        .where('member.id = :userId', { userId: user.id });
    }

    // সার্চ কন্ডিশনটি andWhere দিয়ে যোগ করুন
    projectsQueryBuilder.andWhere(
      '(LOWER(project.name) LIKE :query OR LOWER(project.description) LIKE :query)',
      { query: searchQuery },
    );

    const projectsPromise = projectsQueryBuilder.getMany();

    // --- ২. টাস্ক সার্চের জন্য কোয়েরি বিল্ডার ---
    const tasksQueryBuilder = this.tasksRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.project', 'project'); // টাস্কের সাথে প্রজেক্ট তথ্য সবসময় আনুন

    // --- ADMIN রোলের জন্য নতুন লজিক ---
    if (user.role !== UserRole.ADMIN) {
      // যদি ইউজার Admin না হয়, তাহলেই শুধু প্রজেক্টের মেম্বারশিপ চেক করুন
      tasksQueryBuilder
        .leftJoin('project.members', 'member')
        .where('member.id = :userId', { userId: user.id });
    }

    // সার্চ কন্ডিশনটি andWhere দিয়ে যোগ করুন
    tasksQueryBuilder.andWhere(
      '(LOWER(task.title) LIKE :query OR LOWER(task.description) LIKE :query)',
      { query: searchQuery },
    );

    const tasksPromise = tasksQueryBuilder.getMany();

    // দুটি কোয়েরি একসাথে চালান
    const [projects, tasks] = await Promise.all([
      projectsPromise,
      tasksPromise,
    ]);

    return { projects, tasks };
  }
}
