import { Module, forwardRef } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { TasksModule } from '../tasks/tasks.module'; // TasksModule ইম্পোর্ট করুন

@Module({
  imports: [forwardRef(() => TasksModule)],
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class EventsModule {}
