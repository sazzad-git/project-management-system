import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service'; // সার্ভিস ইম্পোর্ট করুন

describe('TasksController', () => {
  let controller: TasksController;

  // সার্ভিসকে মক করুন
  const mockTasksService = {
    // এখানে আপনার কন্ট্রোলারে ব্যবহৃত সার্ভিস মেথডগুলোকে মক করুন
    findTasksForUser: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        { provide: TasksService, useValue: mockTasksService }, // <-- সার্ভিস প্রোভাইড করুন
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
