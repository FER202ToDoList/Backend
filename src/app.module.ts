import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TaskModule } from './module/task/task.module';
import { ProjectModule } from './module/project/project.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './module/auth/auth.module';
import { PrismaModule } from './module/prisma/prisma.module';
import { UserModule } from './module/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 120 }]),
    TaskModule,
    ProjectModule,
    AuthModule,
    PrismaModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [
    ThrottlerGuard,
    { provide: APP_GUARD, useExisting: ThrottlerGuard },
    AppService,
  ],
})
export class AppModule {}
