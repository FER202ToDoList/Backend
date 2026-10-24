import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

declare const module: any;

async function bootstrap() {
  if (module.hot?.data?.closePromise) {
    // wait for the previous application instance to fully shut down
    await module.hot.data.closePromise;
  }

  const app = await NestFactory.create(AppModule, {
    forceCloseConnections: !!module.hot,
  });

  const configService = app.get(ConfigService);

  const ALLOWED_URLS = configService
    .get<string>('ALLOWED_URLS', '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);

  app.enableCors({
    origin: ALLOWED_URLS,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  });

  const config = new DocumentBuilder()
    .setTitle('Taskflow API')
    .setDescription('Authentication, password recovery, tasks and projects')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose((data: any) => {
      data.closePromise = app.close();
    });
  }
}
bootstrap();
