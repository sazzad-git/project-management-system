// src/app.module.ts (সঠিক সংস্করণ)

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';
import { User } from './users/entities/user.entity'; // ১. User এনটিটি ইম্পোর্ট করুন
import { Task } from './tasks/entities/task.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USER'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        entities: [User, Task], // ২. এখানে User এবং Task উভয়ই যোগ করুন
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    UsersModule, // UsersModule-কেও এখানে ইম্পোর্ট করতে হবে
    TasksModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}