import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';
import { AuthModule } from './auth/auth.module';
import { User } from './users/entities/user.entity';
import { Task } from './tasks/entities/task.entity';
import { TaskActivity } from './tasks/entities/task-activity.entity'; // ১. TaskActivity ইম্পোর্ট করুন
import { ProjectsModule } from './projects/projects.module';
import { Project } from './projects/entities/project.entity';
import { CommentsModule } from './comments/comments.module'; // ১. CommentsModule ইম্পোর্ট করুন
import { Comment } from './comments/entities/comment.entity'; // ২. Comment এনটিটি ইম্পোর্ট করুন
import { EventsGateway } from './events/events.gateway';
import { EventsModule } from './events/events.module';
import { SearchModule } from './search/search.module';

@Module({
  imports: [
    // `.env` ফাইল লোড করার জন্য ConfigModule (গ্লোবালি)
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // ইমেইল পাঠানোর জন্য MailerModule কনফিগারেশন
    MailerModule.forRootAsync({
      imports: [ConfigModule], // MailerModule-এর ভেতরে ConfigService ব্যবহারের জন্য
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('MAIL_HOST'),
          secure: true, // true for 465, false for other ports
          auth: {
            user: configService.get<string>('MAIL_USER'),
            pass: configService.get<string>('MAIL_PASSWORD'),
          },
        },
        defaults: {
          from: configService.get<string>('MAIL_FROM'),
        },
      }),
      inject: [ConfigService], // ConfigService-কে useFactory-তে ইনজেক্ট করা হচ্ছে
    }),

    // ডেটাবেস কানেকশনের জন্য TypeOrmModule কনফিগারেশন
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], // TypeOrmModule-এর ভেতরে ConfigService ব্যবহারের জন্য
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USER'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        entities: [User, Task, TaskActivity, Project, Comment],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),

    UsersModule,
    TasksModule,
    AuthModule,
    ProjectsModule,
    CommentsModule,
    EventsModule,
    SearchModule,
  ],
  controllers: [],
  providers: [EventsGateway],
})
export class AppModule {}
