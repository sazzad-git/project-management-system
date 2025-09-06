import {
  IsEmail,
  IsString,
  MinLength,
  IsNotEmpty,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @IsNotEmpty()
  password: string;

  @IsEnum(UserRole)
  @IsNotEmpty({ message: 'Role is required' })
  role: UserRole;

  @IsString()
  @IsOptional()
  jobTitle?: string;
}
