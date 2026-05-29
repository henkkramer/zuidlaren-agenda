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


## Performance and Runtime Guardrails

The production image is built from a digest-pinned `node:24-alpine` base and the final runner stage uses Next standalone output. The runtime dependency install stage runs `npm ci --omit=dev` to keep dependency resolution explicit while the final image avoids copying duplicate `node_modules` content.

Before deployment, run:

```bash
npm run build
npm run perf:budget
```

The budget command checks the generated Next.js app build manifest and fails if `/`, `/account`, or `/business/[businessId]` exceed their JavaScript gzip budgets. In the Sprint 4 validation build the runner image was 324 MB.

Operational logs in non-production include structured Prisma warnings for slow queries and repeated query shapes. In production, use the existing container logs plus `/api/health` and `/api/health/ready` for runtime checks. Web Vitals are aggregated through the app itself and visible in the admin analytics card after real traffic arrives.
