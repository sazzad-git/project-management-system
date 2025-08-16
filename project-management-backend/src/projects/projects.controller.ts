import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateProjectDto } from './dto/create-project.dto';
import { TasksService } from '../tasks/tasks.service';
import { UpdateProjectDto } from './dto/update-project.dto';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly tasksService: TasksService,
  ) {}

  @Post()
  create(@Body() createProjectDto: CreateProjectDto, @Request() req) {
    return this.projectsService.create(createProjectDto, req.user);
  }

  @Get()
  findAllForUser(@Request() req) {
    return this.projectsService.findAllForUser(req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.projectsService.findOne(id, req.user);
  }

  @Get(':id/tasks')
  findTasksForProject(@Param('id') id: string, @Request() req) {
    return this.tasksService.findAllByProjectId(id, req.user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @Request() req,
  ) {
    return this.projectsService.update(id, updateProjectDto, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.projectsService.remove(id, req.user);
  }

  @Get(':id/gantt')
  getGanttData(@Param('id') id: string, @Request() req) {
    return this.projectsService.getGanttData(id, req.user);
  }
}
