import { IsString, IsNotEmpty, IsArray, IsUUID } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsArray()
  @IsUUID('4', { each: true })
  memberIds: string[]; // প্রজেক্ট তৈরির সময় কোন কোন মেম্বারকে যোগ করা হবে
}
