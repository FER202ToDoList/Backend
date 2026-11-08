# Integration validation — 2026-11-08

- Prisma client generation, NestJS production build and the existing Jest suite passed.
- The matching taskflow HTTP suite passed against PostgreSQL 18: task/project lifecycle, project PATCH validation and ownership, user isolation, JWT behavior, password recovery, first-login flag and concurrent login claiming.
- Six matching frontend browser scenarios passed against this backend, including project editing, numeric task IDs, first-login guide and password recovery via captured test mail.
- Applied the onboarding migration over existing user/task rows in a disposable schema: the account was excluded from automatic onboarding and the task survived.
- Restarted the backend against the same database: task data remained and onboarding did not repeat.

Actual SMTP delivery was not tested with a real mailbox. Configure SMTP credentials and FRONTEND_URL for real mail. The test-only server captures mail and must never be deployed. Apply the paired frontend update and this backend migration together. Main was not merged automatically.
