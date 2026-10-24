import { ConfigService } from '@nestjs/config';

export const getJwtSecretKey = (configService: ConfigService): string => {
  const secret = configService.get<string>('JWT_SECRET');

  if (!secret) {
    throw new Error('JWT_SECRET must be configured');
  }

  return secret;
};

export const getJwtExpiresIn = (configService: ConfigService): number => {
  const seconds = Number(configService.get('JWT_EXPIRES_IN', 86400));
  if (!Number.isFinite(seconds) || seconds <= 0)
    throw new Error('JWT_EXPIRES_IN must be positive seconds');
  return seconds;
};
