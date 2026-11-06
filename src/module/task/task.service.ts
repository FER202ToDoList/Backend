import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}
  list(userId: string) {
    return this.prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
  async find(userId: string, id: number) {
    const task = await this.prisma.task.findFirst({ where: { id, userId } });
    if (!task) throw new NotFoundException('Task not found.');
    return task;
  }
  private async checkProject(userId: string, projectId?: string | null) {
    if (
      projectId &&
      !(await this.prisma.project.findFirst({
        where: { id: projectId, userId },
      }))
    )
      throw new NotFoundException('Project not found.');
  }
  async create(userId: string, dto: CreateTaskDto) {
    await this.checkProject(userId, dto.projectId);
    return this.prisma.task.create({ data: { ...dto, userId } });
  }
  async update(userId: string, id: number, dto: UpdateTaskDto) {
    await this.checkProject(userId, dto.projectId);
    const updated = await this.prisma.task.updateMany({
      where: { id, userId },
      data: dto,
    });
    if (!updated.count) throw new NotFoundException('Task not found.');
    return this.find(userId, id);
  }
  async remove(userId: string, id: number) {
    const result = await this.prisma.task.deleteMany({ where: { id, userId } });
    if (!result.count) throw new NotFoundException('Task not found.');
  }
}
