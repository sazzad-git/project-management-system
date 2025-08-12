import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * ব্যবহারকারী রেজিস্ট্রেশনের জন্য এন্ডপয়েন্ট।
   * এই রাউটটি পাবলিক, এর জন্য কোনো গার্ডের প্রয়োজন নেই।
   */
  @Post('signup')
  signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.signup(createUserDto);
  }

  /**
   * ব্যবহারকারী লগইনের জন্য এন্ডপয়েন্ট।
   * LocalAuthGuard ব্যবহার করে ইমেইল ও পাসওয়ার্ড যাচাই করা হয়।
   */
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    // LocalAuthGuard সফল হলে req.user অবজেক্টটি এখানে পাওয়া যাবে
    return this.authService.login(req.user);
  }
}