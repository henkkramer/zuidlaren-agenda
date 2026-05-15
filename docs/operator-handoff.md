# Operator Handoff

This runbook keeps the controlled MVP operable without routine database edits.

## First Admin

Set the owner email in `.env`:

```bash
ADMIN_EMAIL=owner@example.nl
ADMIN_DISPLAY_NAME=Zuidlaren Agenda beheerder
```

Create or promote that user:

```bash
npm run admin:ensure
```

The command is idempotent. It creates the user when missing, re-enables the account when disabled, grants admin rights, and writes an audit log entry.

The owner still signs in through the normal email login flow at `/account`.

## Controlled Release Routine

Before inviting testers:

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
npm run admin:ensure
```

After deploy:

```bash
RELEASE_BASE_URL=https://<production-host> npm run release:check
```

Resolve release-health warnings before adding new testers.

## Normal Operations

- Use `/admin` for users, businesses, activities, categories, reports, feature flags, billing placeholders, campaigns, analytics, and audit logs.
- Review audit coverage in `docs/audit-log-coverage.md` before expanding sensitive owner/admin actions.
- Keep the privacy processor register in `lib/privacy-processors.ts` aligned with the public privacy page before adding new providers.
- Use backup and restore scripts from `README.md` before risky production changes.
- Keep live payments disabled until the billing foundation is promoted to production payment handling.
- Keep native mobile apps out of MVP operations; mobile API contracts are documentation and future-proofing only.

## When Something Breaks

- Check `/api/health` first for process health.
- Check `/api/health/ready` for database readiness.
- Check `/api/health/release` for release gate warnings.
- Review admin audit logs for recent moderation, role, feature flag, and publish changes.
