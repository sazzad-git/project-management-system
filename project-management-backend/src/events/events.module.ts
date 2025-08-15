import { Module, forwardRef } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { TasksModule } from '../tasks/tasks.module'; // TasksModule ইম্পোর্ট করুন

@Module({
  imports: [forwardRef(() => TasksModule)],
  providers: [EventsGateway],
  exports: [EventsGateway], // অন্য সার্ভিস থেকে ব্যবহারের জন্য এক্সপোর্ট করুন
})
export class EventsModule {}
