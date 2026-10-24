import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/project.dto';
@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}
  list(userId: string) {
    return this.prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
  }
  create(userId: string, dto: CreateProjectDto) {
    return this.prisma.project.create({ data: { ...dto, userId } });
  }
  async remove(userId: string, id: string) {
    const result = await this.prisma.project.deleteMany({
      where: { id, userId },
    });
    if (!result.count) throw new NotFoundException('Project not found.');
  }
}
