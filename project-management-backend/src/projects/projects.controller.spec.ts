import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { TasksService } from '../tasks/tasks.service'; // TasksService-ও লাগবে

describe('ProjectsController', () => {
  let controller: ProjectsController;

  const mockProjectsService = {}; // প্রয়োজনীয় মেথডগুলো মক করুন
  const mockTasksService = {}; // প্রয়োজনীয় মেথডগুলো মক করুন

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [
        { provide: ProjectsService, useValue: mockProjectsService },
        { provide: TasksService, useValue: mockTasksService },
      ],
    }).compile();

    controller = module.get<ProjectsController>(ProjectsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
