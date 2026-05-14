# Zuidlaren Agenda

Mobile-first local activity agenda for Zuidlaren.

## Current Status

The project is in the public agenda UI phase. The app currently uses mock activity data and focuses on the visual shell, responsive agenda feed, activity cards, and detail view.

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
npm run build
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

## Tailscale Linux Deployment

Repeatable deployment notes live in:

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
