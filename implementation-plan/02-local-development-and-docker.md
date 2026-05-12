# 02 - Local Development and Docker

## Goal

Create a reproducible local development setup for the Next.js app, PostgreSQL database, and optional worker process.

## Scope

- Project scaffold.
- Docker Compose.
- Environment variables.
- Local health checks.
- Seed data and database commands.

## Non-Goals

- Public production deployment.
- Payment provider setup.
- HTTPS automation beyond Tailscale/reverse proxy assumptions.

## Technical Decisions

- Use Node LTS.
- Use Docker Compose for `web`, `postgres`, and optional `worker`.
- Use PostgreSQL local volume.
- Keep `.env.example` complete and safe.
- Use Prisma migrations from day one.

## Implementation Tasks

- Scaffold Next.js App Router with TypeScript.
- Add Tailwind CSS and shadcn/ui.
- Add Prisma and PostgreSQL configuration.
- Create `docker-compose.yml`.
- Add `.env.example`.
- Add npm scripts:
  - `dev`
  - `build`
  - `start`
  - `lint`
  - `typecheck`
  - `test`
  - `db:migrate`
  - `db:seed`
- Add health endpoint at `/api/health`.
- Add seed data for categories, locations, one admin user placeholder, one business, and sample activities.

## Docker Services

- `web`: Next.js app.
- `postgres`: PostgreSQL with persistent volume.
- `worker`: optional background worker sharing app image.
- `adminer`: optional development-only database viewer.

## Environment Variables

Required:

- `DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_URL`
- `APP_BASE_URL`
- `EMAIL_FROM`
- `MEDIA_STORAGE_DRIVER=local`
- `MEDIA_LOCAL_DIR`

Reserved for later:

- `MOLLIE_API_KEY`
- `AI_PROVIDER`
- `AI_API_KEY`
- `EMAIL_PROVIDER_API_KEY`

## Tests

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- Health endpoint returns OK.
- Docker Compose starts web and database.
- Prisma migration and seed succeed.

## Acceptance Criteria

- A developer can run the app locally with one documented command.
- The app can later be exposed through `https://mb-linux.sailfish-musical.ts.net`.
- Database data survives container restart.

