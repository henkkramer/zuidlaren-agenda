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

Rollback idea:

git checkout v0.1.0
docker compose up -d --build

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
