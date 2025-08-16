import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SearchService } from './search.service';
import { Project } from '../projects/entities/project.entity';
import { Task } from '../tasks/entities/task.entity';

describe('SearchService', () => {
  let service: SearchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: getRepositoryToken(Project), useValue: {} }, // ProjectRepository-Mock
        { provide: getRepositoryToken(Task), useValue: {} }, // TaskRepository-Mock
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
