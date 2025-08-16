import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsUUID,
  IsDateString,
  IsNumber,
  Min,
  IsOptional,
} from 'class-validator';

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

  // --- নতুন: গ্যান্ট চার্টের জন্য 필্ড ---
  @IsDateString()
  @IsNotEmpty()
  startDate: string; // ফ্রন্টএন্ড থেকে YYYY-MM-DD ফরম্যাটে আসবে

  @IsNumber()
  @Min(1) // সময়কাল কমপক্ষে ১ দিন হতে হবে
  @IsNotEmpty()
  duration: number;

  // --- নতুন: dependencies যোগ করুন ---
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  dependencies?: string[];
}
