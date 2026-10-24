// Test-only server. Never use this entrypoint for production: it exposes captured mail.
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const backend = path.resolve(__dirname, '..');
require('dotenv').config({ path: path.join(backend, '.env'), quiet: true });
const url = new URL(process.env.TEST_DATABASE_URL || process.env.DATABASE_URL);
url.searchParams.set('schema', 'taskflow_e2e');
process.env.DATABASE_URL = url.toString();
process.env.JWT_SECRET = 'isolated-test-secret-not-for-production';
process.env.JWT_EXPIRES_IN = '3600';
execFileSync(
  process.execPath,
  [
    path.join(backend, 'node_modules/prisma/build/index.js'),
    'migrate',
    'deploy',
    '--config',
    'prisma7.config.ts',
  ],
  { cwd: backend, env: process.env, stdio: 'inherit' },
);
require('reflect-metadata');
const { Test } = require('@nestjs/testing');
const { ValidationPipe } = require('@nestjs/common');
const { ThrottlerGuard } = require('@nestjs/throttler');
const { AppModule } = require('../dist/src/app.module');
const { MailService } = require('../dist/src/module/mail/mail.service');
const { PrismaService } = require('../dist/src/module/prisma/prisma.service');
(async () => {
  const sent = new Map();
  const module = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(MailService)
    .useValue({
      sendPasswordReset: async (email, token) => {
        sent.set(email, token);
      },
    })
    .overrideProvider(ThrottlerGuard)
    .useValue({ canActivate: () => true })
    .compile();

  const app = module.createNestApplication();

  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const server = app.getHttpAdapter().getInstance();
  server.get('/__test/reset-token', (req, res) =>
    res.json({ token: sent.get(req.query.email) }),
  );
  server.post('/__test/expire-token', async (req, res) => {
    await app
      .get(PrismaService)
      .passwordReset.updateMany({ data: { expiresAt: new Date(0) } });
    res.sendStatus(204);
  });

  await app.listen(3101, '127.0.0.1');

  const close = async () => {
    await app.close();
    process.exit(0);
  };
  process.on('SIGTERM', close);
  process.on('SIGINT', close);
})();
