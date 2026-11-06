import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { getJwtSecretKey } from '../../../config/global-const';
import { JwtPayloadDto } from '../dto/auth.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: getJwtSecretKey(config),
    });
  }

  async validate(payload: JwtPayloadDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.id },
    });

    if (!user || payload.tokenVersion !== user.tokenVersion) {
      throw new UnauthorizedException('Invalid user credentials');
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }; // Tự động inject vào req.user
  }
}
