import { IsString, IsNotEmpty, IsArray, IsUUID } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  // --- নতুন: assigneeIds অ্যারে ---
  @IsArray()
  @IsUUID('4', { each: true }) // অ্যারের প্রতিটি আইটেম একটি ভ্যালিড UUID কিনা তা চেক করে
  assigneeIds: string[];

  // --- নতুন: projectId যোগ করুন ---
  @IsUUID('4')
  @IsNotEmpty()
  projectId: string;
}
