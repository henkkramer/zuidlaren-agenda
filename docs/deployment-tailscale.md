# Tailscale Linux Deployment

This is the repeatable local-Linux deployment path for testing the MVP over Tailscale. It keeps `.env`, database data, backups, and uploaded media out of Git.

## Target

```text
https://mb-linux.sailfish-musical.ts.net
```

## One-Time Setup

```bash
cp .env.example .env
```

Edit `.env` before first launch:

```text
APP_BASE_URL=https://mb-linux.sailfish-musical.ts.net
NEXT_PUBLIC_APP_BASE_URL=https://mb-linux.sailfish-musical.ts.net
NEXTAUTH_URL=https://mb-linux.sailfish-musical.ts.net
NEXTAUTH_SECRET=<long random secret>
DATABASE_URL=postgresql://zuidlaren:zuidlaren@localhost:55432/zuidlaren_agenda?schema=public
DOCKER_DATABASE_URL=postgresql://zuidlaren:zuidlaren@postgres:5432/zuidlaren_agenda?schema=public
```

## Build And Start

```bash
docker compose up --build -d
```

Apply the current Prisma schema and seed from the host:

```bash
env DATABASE_URL=postgresql://zuidlaren:zuidlaren@localhost:55432/zuidlaren_agenda?schema=public npm run db:push
env DATABASE_URL=postgresql://zuidlaren:zuidlaren@localhost:55432/zuidlaren_agenda?schema=public npm run db:seed
```

## Health Checks

```bash
curl -fsS http://127.0.0.1:3088/api/health
curl -fsS http://127.0.0.1:3088/api/health/ready
```

Expected readiness includes:

```json
{"checks":{"app":"ok","database":"ok"}}
```

## Tailscale Serve

Configure Tailscale separately on the Linux host, then proxy HTTPS traffic to the local app port:

```bash
tailscale serve --bg --https=443 http://127.0.0.1:3088
```

Verify from another device on the tailnet:

```bash
curl -fsS https://mb-linux.sailfish-musical.ts.net/api/health
curl -fsS https://mb-linux.sailfish-musical.ts.net/api/health/ready
```

## Backups

Create a timestamped backup:

```bash
scripts/backup-local.sh
```

Restore one:

```bash
scripts/restore-local.sh backups/YYYYMMDDTHHMMSSZ
```

Backups are written to `backups/`, which is ignored by Git.

## Restart And Logs

```bash
docker compose restart web
docker compose logs -f web
docker compose logs -f postgres
```

## Notes

- Uploaded media is persisted in the `media-uploads` Docker volume.
- PostgreSQL is persisted in the `postgres-data` Docker volume.
- Live payments are not required for MVP deployment.
- `.env` must stay outside Git.
