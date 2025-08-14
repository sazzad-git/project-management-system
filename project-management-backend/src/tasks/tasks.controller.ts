import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Patch, // ১. Patch ইম্পোর্ট করুন
  Param, // ২. Param ইম্পোর্ট করুন
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard'; // ৩. RolesGuard ইম্পোর্ট করুন
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}
  @Get()
  findMyTasks(@Request() req) {
    return this.tasksService.findTasksForUser(req.user);
  }
  @Post()
  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER)
  create(@Body() createTaskDto: CreateTaskDto, @Request() req) {
    return this.tasksService.create(createTaskDto, req.user);
  }
  // এখন আর এরর দেখাবে না
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateTaskStatusDto: UpdateTaskStatusDto,
    @Request() req,
  ) {
    return this.tasksService.updateStatus(
      id,
      updateTaskStatusDto.status,
      req.user,
    );
  }
}
