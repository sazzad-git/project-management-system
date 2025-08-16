import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const newUser = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(newUser);
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findOneById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async save(user: User): Promise<User> {
    return this.usersRepository.save(user);
  }

  async findByResetToken(token: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { passwordResetToken: token },
    });
  }

  async updateProfile(
    id: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<User> {
    const user = await this.findOneById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, updateProfileDto);

    const updatedUser = await this.save(user);

    const { password, ...result } = updatedUser;
    return result as User;
  }

  async findAll(): Promise<Omit<User, 'password'>[]> {
    return this.usersRepository.find({
      select: ['id', 'name', 'email', 'role', 'jobTitle', 'profileImage'],
    });
  }
}
