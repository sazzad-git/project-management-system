import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService, // UsersService ইনজেক্ট করুন
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET not found in environment variables');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  // JWT টোকেন ভ্যালিডেট করার পর এই মেথডটি চলে
  async validate(payload: { sub: string; email: string }) {
    // আমরা payload থেকে id দিয়ে ইউজারকে খুঁজে বের করতে পারি
    // যাতে req.user অবজেক্টে সম্পূর্ণ ইউজার তথ্য থাকে
    const user = await this.usersService.findOneById(payload.sub);
    return user;
  }
}
