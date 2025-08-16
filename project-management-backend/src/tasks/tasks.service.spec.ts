import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { Task } from './entities/task.entity';
import { User } from '../users/entities/user.entity';
import { Project } from '../projects/entities/project.entity';
import { TaskActivity } from './entities/task-activity.entity';
import { EventsGateway } from '../events/events.gateway';
import { DataSource } from 'typeorm';

describe('TasksService', () => {
  let service: TasksService;

  // Repository এবং অন্যান্য নির্ভরতা মক করুন
  const mockTaskRepository = { find: jest.fn() };
  const mockUserRepository = {};
  const mockProjectRepository = {};
  const mockActivityRepository = {};
  const mockDataSource = {};
  const mockEventsGateway = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: getRepositoryToken(Task), useValue: mockTaskRepository },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        {
          provide: getRepositoryToken(Project),
          useValue: mockProjectRepository,
        },
        {
          provide: getRepositoryToken(TaskActivity),
          useValue: mockActivityRepository,
        },
        { provide: DataSource, useValue: mockDataSource },
        { provide: EventsGateway, useValue: mockEventsGateway },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
