import type { AuthenticatedRequest } from '../auth/auth.types';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt.guard';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import { ProjectService } from './project.service';
@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectController {
  constructor(private service: ProjectService) {}
  @Get() list(@Req() req: AuthenticatedRequest) {
    return this.service.list(req.user.id);
  }
  @Post() create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateProjectDto,
  ) {
    return this.service.create(req.user.id, dto);
  }
  @Patch(':id') update(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.service.update(req.user.id, id, dto);
  }
  @Delete(':id') @HttpCode(204) remove(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.remove(req.user.id, id);
  }
}
