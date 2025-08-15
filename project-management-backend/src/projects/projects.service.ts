import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Project } from './entities/project.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(
    createProjectDto: CreateProjectDto,
    creator: User,
  ): Promise<Project> {
    if (
      creator.role !== UserRole.ADMIN &&
      creator.role !== UserRole.PROJECT_MANAGER
    ) {
      throw new UnauthorizedException(
        'Only Admins and Project Managers can create projects.',
      );
    }

    const { memberIds, ...projectData } = createProjectDto;
    const members = await this.usersRepository.findBy({ id: In(memberIds) });

    const newProject = this.projectsRepository.create({
      ...projectData,
      creator,
      members: [...members, creator],
    });

    return this.projectsRepository.save(newProject);
  }

  async findAllForUser(user: User): Promise<Project[]> {
    if (user.role === UserRole.ADMIN) {
      return this.projectsRepository.find({
        relations: ['creator', 'members'],
      });
    }
    return this.projectsRepository
      .createQueryBuilder('project')
      .leftJoin('project.members', 'member')
      .where('member.id = :userId', { userId: user.id })
      .leftJoinAndSelect('project.creator', 'creator')
      .leftJoinAndSelect('project.members', 'all_members')
      .getMany();
  }

  // --- সমাধানটি এখানে: এই নতুন মেথডটি যোগ করুন ---
  async findOne(id: string, user: User): Promise<Project> {
    const project = await this.projectsRepository.findOne({
      where: { id },
      relations: ['creator', 'members', 'tasks'], // tasks-ও লোড করতে পারেন
    });

    if (!project) {
      throw new NotFoundException(`Project with ID "${id}" not found.`);
    }

    // পারমিশন চেক: ইউজার কি Admin অথবা এই প্রজেক্টের সদস্য?
    const isMember = project.members.some((member) => member.id === user.id);

    if (user.role !== UserRole.ADMIN && !isMember) {
      throw new UnauthorizedException(
        'You do not have permission to view this project.',
      );
    }

    return project;
  }

  // --- নতুন: update মেথড ---
  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
    user: User,
  ): Promise<Project> {
    const project = await this.projectsRepository.findOneBy({ id });
    if (!project) {
      throw new NotFoundException(`Project with ID "${id}" not found.`);
    }

    // পারমিশন চেক: শুধুমাত্র Admin অথবা প্রজেক্টের স্রষ্টা (Creator) প্রজেক্ট এডিট করতে পারবে
    if (user.role !== UserRole.ADMIN && project.creator.id !== user.id) {
      throw new UnauthorizedException(
        'You do not have permission to edit this project.',
      );
    }

    const { memberIds, ...projectDetails } = updateProjectDto;

    // নাম এবং ডেসক্রিপশন আপডেট করুন
    Object.assign(project, projectDetails);

    // মেম্বারদের তালিকা আপডেট করুন (যদি পাঠানো হয়)
    if (memberIds) {
      const newMembers = await this.usersRepository.findBy({
        id: In(memberIds),
      });
      project.members = newMembers;
    }

    return this.projectsRepository.save(project);
  }

  // --- নতুন: remove মেথড ---
  async remove(id: string, user: User): Promise<{ message: string }> {
    const project = await this.projectsRepository.findOne({
      where: { id },
      relations: ['creator'],
    });
    if (!project) {
      throw new NotFoundException(`Project with ID "${id}" not found.`);
    }

    // পারমিশন চেক: শুধুমাত্র Admin অথবা প্রজেক্টের স্রষ্টা প্রজেক্ট ডিলিট করতে পারবে
    if (user.role !== UserRole.ADMIN && project.creator.id !== user.id) {
      throw new UnauthorizedException(
        'You do not have permission to delete this project.',
      );
    }

    // onDelete: 'CASCADE' (Task এনটিটিতে) থাকার কারণে, এই প্রজেক্টের সাথে সম্পর্কিত সব টাস্ক স্বয়ংক্রিয়ভাবে ডিলিট হয়ে যাবে
    await this.projectsRepository.delete(id);

    return {
      message: 'Project and all related tasks have been deleted successfully.',
    };
  }
}
