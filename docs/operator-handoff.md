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
- Use backup and restore scripts from `README.md` before risky production changes. Follow the exact source/image rollback and database migration posture in `docs/DEPLOYMENT.md`.
- Keep live payments disabled until the billing foundation is promoted to production payment handling.
- Keep native mobile apps out of MVP operations; mobile API contracts are documentation and future-proofing only.

## Calendar Exports

The app exposes three iCalendar paths for public discovery and personal planning:

- `GET /api/public/calendar` for the public agenda feed.
- `GET /api/public/activities/{activityId}/calendar` for one published activity.
- `GET /api/me/agenda/calendar` for the signed-in user's saved agenda.

Public calendar responses use short public cache headers. Personal calendar responses use private no-store headers and `X-Robots-Tag: noindex, nofollow, noarchive`.

Repeat calendar clients should send `If-None-Match`; matching feeds return `304 Not Modified` and do not count as a fresh export. High-frequency clients receive `429` with `Retry-After`. Use `docs/calendar-abuse-response.md` for repeated polling incidents and keep `/api/public/calendar?limit=3` in the release check.

Admin analytics show aggregate calendar export volume only. Personal exports do not include user ids or selected activity ids in analytics dimensions.

Run `docs/calendar-runbook-drill.md` before inviting a new tester group or after changing calendar export behavior.
Use `docs/calendar-maintenance-checklist.md` for routine calendar export maintenance.

## When Something Breaks

- Check `/api/health` first for process health.
- Check `/api/health/ready` for database readiness.
- Check `/api/health/release` for release gate warnings.
- Review admin audit logs for recent moderation, role, feature flag, and publish changes.
