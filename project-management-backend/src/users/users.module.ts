// src/users/users.module.ts (সঠিক সংস্করণ)
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // ১. TypeOrmModule ইম্পোর্ট করুন
import { User } from './entities/user.entity';     // ২. User এনটিটি ইম্পোর্ট করুন
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // ৩. এই লাইনটি যোগ করুন
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // এই লাইনটি ঠিক আছে এবং আবশ্যক
})
export class UsersModule {}