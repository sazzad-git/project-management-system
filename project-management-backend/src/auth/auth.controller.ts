import { Controller, Post, Get, Body, UseGuards, Request, Param, Patch } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard'; // JwtAuthGuard ইম্পোর্ট করুন

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/signup
   * ব্যবহারকারী রেজিস্ট্রেশনের জন্য। এটি একটি পাবলিক রাউট।
   */
  @Post('signup')
  signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.signup(createUserDto);
  }

  /**
   * POST /auth/login
   * ব্যবহারকারী লগইনের জন্য। LocalAuthGuard দিয়ে ইমেইল/পাসওয়ার্ড যাচাই করা হয়।
   */
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  /**
   * GET /auth/profile
   * লগইন করা ব্যবহারকারীর তথ্য পাওয়ার জন্য। JwtAuthGuard দিয়ে সুরক্ষিত।
   */
  @UseGuards(JwtAuthGuard) // নিশ্চিত করে যে শুধুমাত্র লগইন করা ইউজাররাই এটি অ্যাক্সেস করতে পারবে
  @Get('profile')
  getProfile(@Request() req: { user: any }) {
    // JwtAuthGuard টোকেন ভ্যালিডেট করার পর req.user-এ ইউজার তথ্য যোগ করে দেয়
    return req.user;
  }

  /**
   * POST /auth/logout
   * ব্যবহারকারীকে লগআউট করার জন্য। JwtAuthGuard দিয়ে সুরক্ষিত।
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Request() req) {
    // বর্তমানে এটি শুধু একটি সফলতার বার্তা পাঠায়।
    // ভবিষ্যতে এখানে টোকেন ব্ল্যাকলিস্ট করার লজিক যোগ করা যেতে পারে।
    return { message: 'User logged out successfully' };
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    // সার্ভিসটি একটি অবজেক্ট রিটার্ন করবে যাতে resetToken আছে
    const result = await this.authService.forgotPassword(email);
    // ডেভেলপমেন্টের জন্য:
    console.log('Password Reset Token:', result.resetToken);
    return { message: 'If a user with that email exists, a password reset token has been generated.' };
  }

  @Patch('reset-password/:token')
  async resetPassword(
    @Param('token') token: string,
    @Body('password') password: string,
  ) {
    return this.authService.resetPassword(token, password);
  }
}
