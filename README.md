# Taskflow backend

NestJS + Prisma + PostgreSQL. Features live in src/module/{auth,user,task,project,mail,prisma}, with controllers, services and module-owned DTOs. Swagger: http://localhost:3000/api. Health: GET /health.

## Run locally

1. npm install
2. Copy .env.example to .env only if no .env exists. Otherwise add the missing settings while keeping your database/JWT values.
3. Start PostgreSQL: docker compose -f docker/docker-compose.yml up -d
4. npm run prisma:generate
5. npm run db:migrate
6. npm run start:dev

Production: npm run build then npm run start:prod. ALLOWED_URLS is a comma-separated frontend origin allowlist. JWT_EXPIRES_IN is positive seconds (default 86400). FRONTEND_URL is the frontend receiving reset links.

## Email

Fill SMTP_USER with your Gmail address and SMTP_PASS with its app password. Defaults: smtp.gmail.com, port 587, SMTP_SECURE=false (STARTTLS). For port 465 use SMTP_SECURE=true. SMTP_FROM defaults to SMTP_USER. Keep mail credentials only in the backend .env.

Reset tokens are random, hashed with SHA-256 in the database, single-use, and expire after 30 minutes. A new request replaces the previous link. Password reset atomically consumes the token and invalidates prior JWTs. Forgot-password returns the same response for unknown accounts and SMTP failures to avoid revealing account existence. Mail failures are logged without credentials/tokens. Email delivery requires SMTP configuration.

Auth routes have per-IP limits. The in-memory rate-limit store supports a single server; use a shared store when deploying multiple instances.

## API

| Method | Path | Body / purpose |
| --- | --- | --- |
| POST | /auth/register | fullName, email, password; returns public user fields |
| POST | /auth/login | email, password; returns token |
| GET | /auth/me | Current user profile |
| POST | /auth/forgot-password | email |
| POST | /auth/reset-password | token, password |
| GET | /tasks | Owned tasks |
| GET | /tasks/:id | Owned task detail |
| POST | /tasks | title; optional description, isCompleted, dueDate, priority, projectId |
| PATCH | /tasks/:id | Partial task fields |
| DELETE | /tasks/:id | Delete owned task; 204 |
| GET | /projects | Owned projects |
| POST | /projects | name, optional hex color |
| DELETE | /projects/:id | Delete project; its tasks move to Inbox; 204 |

Profile/task/project routes require a bearer token. Task IDs are integers; project IDs are UUIDs. Priority is 1–4. dueDate is YYYY-MM-DD or null; projectId is an owned project UUID or null. Unknown fields, invalid dates, empty titles and foreign ownership are rejected. Search/filter/sort happen in the frontend over the user's task list.

The additive migration preserves existing users/tasks. Previous JWTs need a new login because tokens now contain tokenVersion. SQLite demo data is not migrated.

## Tests

npm test -- --runInBand runs unit tests. Full HTTP/browser tests are in ../taskflow/tests. test/start-test-server.cjs is test-only: it exposes captured mail, migrates a separate taskflow_e2e PostgreSQL schema using TEST_DATABASE_URL or DATABASE_URL, and disables rate limiting for repeated reset tests. Never deploy this test entrypoint. Production scripts do not load it.
