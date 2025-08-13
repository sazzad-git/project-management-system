import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * ব্যবহারকারী রেজিস্ট্রেশনের জন্য আপডেটেড মেথড।
   * এটি এখন role এবং ঐচ্ছিক jobTitle সহ সম্পূর্ণ DTO গ্রহণ করে।
   */
  async signup(createUserDto: CreateUserDto) {
    // শুধুমাত্র ভ্যালিডেশনের জন্য email এবং password destructure করুন
    const { email, password } = createUserDto;

    // ১. ইউজার আগে থেকেই আছে কিনা চেক করুন
    const existingUser = await this.usersService.findOneByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // ২. পাসওয়ার্ড হ্যাশ করুন
    const hashedPassword = await bcrypt.hash(password, 10);

    // ৩. নতুন ইউজার তৈরি করুন
    // createUserDto-এর সকল প্রপার্টি (name, email, role, jobTitle) নিন
    // এবং password-কে হ্যাশ করা পাসওয়ার্ড দিয়ে প্রতিস্থাপন করুন
    const user = await this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
    });
    // ৪. রেসপন্স থেকে পাসওয়ার্ড সরিয়ে ফেলুন
    // (TypeScript-কে জানানোর জন্য যে user অবজেক্টে password আছে)
    const { password: _, ...result } = (user as any)._doc || user;
    return result;
  }

  /**
   * ব্যবহারকারী ভ্যালিডেট করার মেথড (অপরিবর্তিত)
   */
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  /**
   * লগইন করার মেথড (অপরিবর্তিত)
   */
  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async forgotPassword(email: string): Promise<{ resetToken: string }> {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException('User with this email does not exist');
    }

    // ১. একটি র্যান্ডম রিসেট টোকেন তৈরি করুন
    const resetToken = crypto.randomBytes(32).toString('hex');

    // ২. টোকেনটিকে হ্যাশ করে ডেটাবেসে সেভ করুন
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    // ৩. টোকেনের মেয়াদ ১০ মিনিট সেট করুন
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

    await this.usersService.save(user); // UsersService-এ একটি save মেথড লাগবে

    // ৪. ডেভেলপমেন্টের জন্য, আমরা টোকেনটি সরাসরি রিটার্ন করব
    // প্রোডাকশনে, এই টোকেনটি ইউজারকে ইমেইল করা হবে
    return { resetToken };
  }
  async resetPassword(token: string, newPass: string): Promise<User> {
    // ১. হ্যাশ করা টোকেন দিয়ে ইউজারকে খুঁজুন
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await this.usersService.findByResetToken(hashedToken);

      if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
        throw new UnauthorizedException('Token is invalid or has expired');
      }

    // ২. নতুন পাসওয়ার্ড হ্যাশ করুন
    user.password = await bcrypt.hash(newPass, 10);

    // ৩. রিসেট টোকেন এবং মেয়াদ মুছে ফেলুন
    user.passwordResetToken = null;
    user.passwordResetExpires = null;

    const updatedUser = await this.usersService.save(user);
    const { password, ...result } = updatedUser;
    return result as User;
  }
}
