# 19 - Deployment on Tailscale Linux

## Goal

Deploy the MVP locally on Linux and expose it safely over Tailscale for testing.

## Scope

- Docker Compose deployment.
- Environment setup.
- Tailscale/reverse proxy assumptions.
- Backups and logs.

## Non-Goals

- Public production launch.
- Kubernetes.
- Managed cloud deployment.

## Target

Initial test hostname:

```text
https://mb-linux.sailfish-musical.ts.net
```

## Deployment Tasks

- Build production Docker image.
- Start `web` and `postgres`.
- Run Prisma migrations.
- Run seed command.
- Configure environment variables.
- Verify health endpoint.
- Configure Tailscale Serve or reverse proxy separately.
- Document backup/restore commands.

## Health Checks

- `/api/health`: app running.
- `/api/health/ready`: database connection ready.

## Backup Strategy

- Use `pg_dump` for PostgreSQL.
- Back up media volume.
- Store `.env` securely outside repository.
- Test restore before real launch.

## Tests

- App reachable over local HTTP.
- App reachable through Tailscale HTTPS after proxy setup.
- Restart preserves database data.
- Migration works on a clean database.

## Acceptance Criteria

- The MVP can be tested from another device through Tailscale.
- Deployment instructions are repeatable.

