import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MailModule } from '../mail/mail.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getJwtExpiresIn, getJwtSecretKey } from '../../config/global-const';
import { JwtStrategy } from './strategy/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    MailModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: getJwtSecretKey(configService),
        signOptions: {
          expiresIn: getJwtExpiresIn(configService),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
