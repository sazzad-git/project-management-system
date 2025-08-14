import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer'; // ১. MailerService ইম্পোর্ট করুন
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '../users/entities/user.entity';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailerService: MailerService, // ২. MailerService ইনজেক্ট করুন
  ) {}

  // signup, validateUser, এবং login মেথডগুলো অপরিবর্তিত থাকবে
  async signup(createUserDto: CreateUserDto) {
    const { email, password } = createUserDto;
    const existingUser = await this.usersService.findOneByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
    });
    const { password: _, ...result } = user;
    return result;
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: User) {
    const payload = { email: user.email, sub: user.id, role: user.role };

    // পাসওয়ার্ড ফিল্ডটি রেসপন্স থেকে বাদ দিন
    const { password, ...userProfile } = user;
    return {
      access_token: this.jwtService.sign(payload),
      user: userProfile,
    };
  }

  // --- forgotPassword মেথডটি এখন ইমেইল পাঠাবে ---
  async forgotPassword(email: string): Promise<void> {
    // ৩. এখন আর টোকেন রিটার্ন করবে না
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      // নিরাপত্তা জনিত কারণে, ইউজার না থাকলেও আমরা কোনো এরর দেখাব না
      console.log(`Password reset attempt for non-existent email: ${email}`);
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // ১০ মিনিটের মেয়াদ
    await this.usersService.save(user);

    const resetURL = `http://localhost:3000/reset-password/${resetToken}`;

    // ৪. ইমেইল পাঠানোর লজিক
    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Your Password Reset Link for ProjectFlow',
        html: `
          <h3>Password Reset Request</h3>
          <p>You have requested to reset your password. Please click on the link below to proceed:</p>
          <p><a href="${resetURL}" target="_blank">Reset Password</a></p>
          <p>This link will expire in 10 minutes.</p>
          <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
        `,
      });
      console.log(`Password reset email sent to ${user.email}`);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      // এখানে ভবিষ্যতে কোনো ফলব্যাক বা রি-ট্রাই লজিক যোগ করা যেতে পারে
      // আপাতত টোকেনগুলো মুছে দিন যাতে ইউজার আবার চেষ্টা করতে পারে
      user.passwordResetToken = null;
      user.passwordResetExpires = null;
      await this.usersService.save(user);
      throw new Error(
        'Failed to send password reset email. Please try again later.',
      );
    }
  }

  // resetPassword মেথডটি অপরিবর্তিত থাকবে
  async resetPassword(token: string, newPass: string): Promise<User> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await this.usersService.findByResetToken(hashedToken);

    if (
      !user ||
      !user.passwordResetExpires ||
      user.passwordResetExpires < new Date()
    ) {
      throw new UnauthorizedException('Token is invalid or has expired');
    }

    user.password = await bcrypt.hash(newPass, 10);
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    const updatedUser = await this.usersService.save(user);
    const { password, ...result } = updatedUser;
    return result as User;
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.usersService.findOneById(userId);

    // UsersService findOneById এখন null রিটার্ন করতে পারে
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // ১. পুরনো পাসওয়ার্ডটি সঠিক কিনা যাচাই করুন
    const isPasswordMatching = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isPasswordMatching) {
      throw new UnauthorizedException('Incorrect current password.');
    }

    // ২. নতুন পাসওয়ার্ড হ্যাশ করুন
    const hashedNewPassword = await bcrypt.hash(
      changePasswordDto.newPassword,
      10,
    );

    // ৩. ইউজারের পাসওয়ার্ড আপডেট করুন এবং সেভ করুন
    user.password = hashedNewPassword;
    await this.usersService.save(user);

    return { message: 'Password changed successfully.' };
  }
}
