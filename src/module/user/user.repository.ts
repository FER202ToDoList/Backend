import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UserDto } from './dto/user.dto';
import { Role } from '../../config/role';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<UserDto | null> {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async createUser(user: CreateUserDto): Promise<UserDto> {
    return this.prisma.user.create({
      data: user,
    });
  }

  async createAdmin(user: CreateUserDto): Promise<UserDto> {
    return this.prisma.user.create({
      data: {
        ...user,
        role: Role.ADMIN,
      },
    });
  }
}
