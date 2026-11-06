import { ConfigService } from '@nestjs/config';

export const getJwtSecretKey = (configService: ConfigService): string => {
  const secret = configService.get<string>('JWT_SECRET');

  if (!secret) {
    throw new Error('JWT_SECRET must be configured');
  }

  return secret;
};

export const getJwtExpiresIn = (configService: ConfigService): number => {
  return configService.get<number>('JWT_EXPIRES_IN') || 0;
};
