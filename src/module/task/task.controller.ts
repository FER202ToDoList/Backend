import type { AuthenticatedRequest } from '../auth/auth.types';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt.guard';
import { TaskService } from './task.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TaskController {
  constructor(private service: TaskService) {}
  @Get() list(@Req() req: AuthenticatedRequest) {
    return this.service.list(req.user.id);
  }
  @Get(':id') find(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.find(req.user.id, id);
  }
  @Post() create(@Req() req: AuthenticatedRequest, @Body() dto: CreateTaskDto) {
    return this.service.create(req.user.id, dto);
  }
  @Patch(':id') update(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.service.update(req.user.id, id, dto);
  }
  @Delete(':id') @HttpCode(204) remove(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.remove(req.user.id, id);
  }
}
