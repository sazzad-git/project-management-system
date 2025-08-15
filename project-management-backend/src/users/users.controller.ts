import {
  Controller,
  Patch,
  Body,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Patch('me/profile')
  updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    const userId = req.user.id;
    return this.usersService.updateProfile(userId, updateProfileDto);
  }

  @UseGuards(JwtAuthGuard) // নিশ্চিত করুন যে শুধুমাত্র লগইন করা ইউজাররাই তালিকাটি দেখতে পারে
  @Get()
  findAll() {
    // UsersService-এ একটি findAll মেথড লাগবে যা পাসওয়ার্ড ছাড়া সব ইউজারকে রিটার্ন করে
    return this.usersService.findAll();
  }
}
