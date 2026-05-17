# Zuidlaren Agenda

Mobile-first local activity agenda for Zuidlaren.

## Current Status

The project has a controlled MVP surface: public agenda, filters, accounts, private-by-default attendance, business publishing, admin tools, privacy pages, deployment foundations, and mobile-ready public API contracts.

Sprint queue:

```text
implementation-plan/SPRINT-QUEUE.md
```

## Local Development

Install dependencies:

```bash
npm install
```

Start the dev server on the project test port:

```bash
npm run dev:3088
```

Open:

```text
http://localhost:3088
```

## Verification

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
```

Pull requests run the same checks in GitHub Actions. See:

```text
docs/ci-release-gate.md
```

Create or promote the first admin account:

```bash
npm run admin:ensure
```

Set `ADMIN_EMAIL` in `.env` before running it.

Real login links require SMTP configuration:

```bash
EMAIL_SERVER=smtp://user:password@smtp.example.nl:587
EMAIL_FROM=Zuidlaren Agenda <noreply@example.nl>
```

If `EMAIL_SERVER` is not set, the app logs the login link in the server output instead of sending mail. Search the web logs for:

```text
auth.login_link.fallback
loginLink
```

Check a deployed release:

```bash
RELEASE_BASE_URL=https://example.nl npm run release:check
```

Health endpoint:

```bash
curl -fsS http://127.0.0.1:3088/api/health
```

## Docker Compose

Copy environment defaults if needed:

```bash
cp .env.example .env
```

Start the production-style app and PostgreSQL:

```bash
docker compose up --build
```

The app is exposed on:

```text
http://localhost:3088
```

PostgreSQL is included now so database sprints have a stable local target. It is available to Compose services as `postgres:5432` and on the host as `localhost:55432`, avoiding conflicts with an existing local database on `5432`.

## Production Deployment

Production traffic is expected to reach the app through the reverse proxy on the production server. Launch readiness notes live in:

```text
docs/mvp-launch-readiness.md
```

Deployment notes live in:

```text
docs/deployment-tailscale.md
```

Short path:

```bash
cp .env.example .env
docker compose up --build -d
env DATABASE_URL=postgresql://zuidlaren:zuidlaren@localhost:55432/zuidlaren_agenda?schema=public npm run db:push
env DATABASE_URL=postgresql://zuidlaren:zuidlaren@localhost:55432/zuidlaren_agenda?schema=public npm run db:seed
curl -fsS http://127.0.0.1:3088/api/health/ready
curl -fsS http://127.0.0.1:3088/api/health/release
```

Backups:

```bash
scripts/backup-local.sh
scripts/restore-local.sh backups/YYYYMMDDTHHMMSSZ
```

## Important Product Constraints

- Public agenda first.
- Browsing works without login.
- Dutch UI copy.
- No comments, likes, followers, chat, or social feed.
- `Ik ga` is private by default and is not a formal reservation.

## Operator Handoff

Controlled MVP operations are documented in:

```text
docs/operator-handoff.md
```
