import { IsString, IsOptional, IsUrl, IsEnum } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  jobTitle?: string;

  @IsUrl()
  @IsOptional()
  profileImage?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
