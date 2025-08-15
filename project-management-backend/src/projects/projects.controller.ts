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
import { UpdateProjectDto } from './dto/update-project.dto'; // নতুন DTO ইম্পোর্ট করুন

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

  // --- এই নতুন মেথডটি যোগ করুন ---
  @Get(':id') // এটি /projects/:id রাউট তৈরি করবে
  findOne(@Param('id') id: string, @Request() req) {
    return this.projectsService.findOne(id, req.user);
  }

  @Get(':id/tasks') // এটি /projects/:id/tasks রাউট তৈরি করবে
  findTasksForProject(@Param('id') id: string, @Request() req) {
    // এখানে আমরা প্রথমে প্রজেক্টের উপর পারমিশন চেক করতে পারি,
    // অথবা সরাসরি টাস্ক সার্ভিসের মেথডকে কল করতে পারি।
    // findOne মেথডটি কল করলে পারমিশন চেক স্বয়ংক্রিয়ভাবে হয়ে যাবে।
    // await this.projectsService.findOne(id, req.user); // পারমিশন চেক

    return this.tasksService.findAllByProjectId(id, req.user);
  }

  // --- নতুন: update এন্ডপয়েন্ট ---
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @Request() req,
  ) {
    return this.projectsService.update(id, updateProjectDto, req.user);
  }

  // --- নতুন: remove এন্ডপয়েন্ট ---
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.projectsService.remove(id, req.user);
  }
}
