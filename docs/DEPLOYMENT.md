# Deployment — Zuidlaren Agenda

Production location:
/opt/apps/zuidlaren-agenda

Expected port:
3090

Manual deployment:

ssh kramer
cd /opt/apps/zuidlaren-agenda
git pull --ff-only
docker compose up -d --build
scripts/compose-db-maintenance.sh seed
scripts/compose-db-maintenance.sh admin
docker compose ps
docker compose logs --tail=100
curl -fsS http://127.0.0.1:3090/api/health/release

## Rollback Drill

Rollback is source-first unless a tagged image rollback is available in the target environment. Always capture the current commit before changing the running release:

```bash
git rev-parse --short HEAD
docker compose ps
docker compose logs --tail=100 web
```

### Source Rollback

Use this when production is deployed from a checked-out Git worktree:

```bash
ssh kramer
cd /opt/apps/zuidlaren-agenda
git fetch --all --tags
git checkout <known-good-commit-or-tag>
docker compose up -d --build web
docker compose ps
curl -fsS http://127.0.0.1:3090/api/health/release
```

### Image Rollback

Use this only when compose is configured to pull immutable image tags instead of building the local source. Roll back by setting the previous known-good image tag in the compose environment, then recreate the web service:

```bash
IMAGE_TAG=<known-good-image-tag> docker compose up -d web
docker compose ps
curl -fsS http://127.0.0.1:3090/api/health/release
```

### Database Migration Posture

- Prefer backward-compatible Prisma schema changes for MVP releases.
- Do not roll back the database automatically during an application rollback.
- Before destructive schema work, take a backup and document the manual restore point.
- If a bad release included only application code, roll back source or image and leave Postgres untouched.
- If a bad release included a destructive migration or data mutation, stop and restore from the documented backup instead of improvising a down migration.

After any rollback, run the same release gate used after deployment:

```bash
curl -fsS http://127.0.0.1:3090/api/health
curl -fsS http://127.0.0.1:3090/api/health/ready
curl -fsS http://127.0.0.1:3090/api/health/release
```

## Production Data Bootstrap

The production Postgres service is available inside the Docker network as `postgres:5432`.
Do not use the local development host port `localhost:55432` on the production server unless the compose file explicitly publishes it.

Use the compose maintenance wrapper from the project root:

```bash
scripts/compose-db-maintenance.sh seed
scripts/compose-db-maintenance.sh admin
```

`seed` applies the Prisma schema and upserts the public activity seed data.
`admin` runs the idempotent admin bootstrap from `scripts/ensure-admin.ts`.

Before running `admin`, production `.env` must include:

```text
ADMIN_EMAIL=owner@example.nl
ADMIN_DISPLAY_NAME=Zuidlaren Agenda beheerder
EMAIL_SERVER=smtp://user:password@smtp.example.nl:587
EMAIL_FROM=Zuidlaren Agenda <noreply@example.local>
```

`EMAIL_SERVER` enables real magic-link email delivery for `/account` login. If it is missing, the app falls back to logging the login link in server output for local development.

After changing `.env`, restart the web service:

```bash
docker compose up -d web
```
