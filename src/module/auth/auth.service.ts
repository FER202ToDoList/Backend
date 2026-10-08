import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import {
  LoginRequestDto,
  LoginResponseDto,
  RegisterRequestDto,
  RegisterResponseDto,
} from 'src/dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../user/user.repository';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private userRepository: UserRepository,
  ) {}
  async login(dto: LoginRequestDto): Promise<LoginResponseDto> {
    const user = await this.userRepository.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Email or password is incorrect.');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Email or password is incorrect.');
    }

    const payload = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    };
    return {
      token: await this.jwtService.signAsync(payload),
    };
  }

  async register(dto: RegisterRequestDto): Promise<RegisterResponseDto> {
    const userExists = await this.userRepository.findByEmail(dto.email);

    if (userExists) {
      throw new BadRequestException('Email already exists.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.userRepository.createUser({
      email: dto.email,
      fullName: dto.fullName,
      password: hashedPassword,
    });
    
    return user;
  }
}
