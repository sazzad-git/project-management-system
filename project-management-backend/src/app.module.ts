// src/app.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';
import { AuthModule } from './auth/auth.module'; // <-- AuthModule ইম্পোর্ট করা আছে (সঠিক)
import { User } from './users/entities/user.entity';
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
        entities: [User, Task],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    // আপনার সমস্ত ফিচার মডিউল এখানে থাকবে
    UsersModule,
    TasksModule,
    AuthModule, // <-- AuthModule এখানে যোগ করা আছে (সঠিক)
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}