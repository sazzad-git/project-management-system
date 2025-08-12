// src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // ১. ValidationPipe ইম্পোর্ট করা হয়েছে

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS কনফিগারেশন (আপনার আগের কোড থেকে)
  app.enableCors({
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // ২. গ্লোবাল ভ্যালিডেশন পাইপ যোগ করা হয়েছে
  // এটি নিশ্চিত করবে যে আপনার DTO-গুলো সঠিকভাবে ভ্যালিডেট হচ্ছে
  app.useGlobalPipes(new ValidationPipe()); 

  // listen() (আপনার আগের কোড থেকে)
  await app.listen(process.env.PORT ?? 3001);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();