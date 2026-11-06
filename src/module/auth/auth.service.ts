import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import {
  LoginRequestDto,
  RegisterRequestDto,
  ResetPasswordDto,
} from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'node:crypto';
import { MailService } from '../mail/mail.service';
const resetMessage = {
  message:
    'If an account exists for that email, a password reset link will be sent.',
};
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mail: MailService,
  ) {}
  async login(dto: LoginRequestDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user || !(await bcrypt.compare(dto.password, user.password)))
      throw new UnauthorizedException('Email or password is incorrect.');
    return {
      token: await this.jwtService.signAsync({
        id: user.id,
        tokenVersion: user.tokenVersion,
      }),
    };
  }
  async register(dto: RegisterRequestDto) {
    const password = await bcrypt.hash(dto.password, 12);
    try {
      return await this.prisma.user.create({
        data: { email: dto.email, fullName: dto.fullName, password },
        select: { id: true, email: true, fullName: true, role: true },
      });
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2002'
      )
        throw new BadRequestException('Email already exists.');
      throw error;
    }
  }
  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return resetMessage;
    const token = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const data = {
      tokenHash,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      createdAt: new Date(),
    };
    await this.prisma.passwordReset.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...data },
      update: data,
    });
    try {
      await this.mail.sendPasswordReset(email, token);
    } catch {
      await this.prisma.passwordReset.deleteMany({
        where: { userId: user.id, tokenHash },
      });
      this.logger.error(
        'Password reset email could not be delivered. Check SMTP configuration and connectivity.',
      );
    }
    return resetMessage;
  }
  async resetPassword(dto: ResetPasswordDto) {
    const tokenHash = createHash('sha256').update(dto.token).digest('hex');
    const password = await bcrypt.hash(dto.password, 12);
    await this.prisma.$transaction(async (tx) => {
      const reset = await tx.passwordReset.findUnique({ where: { tokenHash } });
      if (!reset || reset.expiresAt <= new Date())
        throw new BadRequestException(
          'This reset link is invalid or has expired. Request a new link.',
        );
      // Conditional deletion claims the token once, including concurrent requests.
      const claimed = await tx.passwordReset.deleteMany({
        where: { tokenHash, expiresAt: { gt: new Date() } },
      });
      if (claimed.count !== 1)
        throw new BadRequestException(
          'This reset link is invalid or has expired.',
        );
      await tx.user.update({
        where: { id: reset.userId },
        data: { password, tokenVersion: { increment: 1 } },
      });
    });
    return {
      message: 'Password updated. Please log in with your new password.',
    };
  }
}
