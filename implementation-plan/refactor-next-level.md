# Refactor Next Level Roadmap

Created from the Master Planner / ECC review pass on 2026-05-29.

## Project Map

- Stack: Next.js 15, React 19, TypeScript, NextAuth email login, Prisma 7/PostgreSQL adapter, Docker standalone output.
- Domains: public activity agenda, user agenda, business management, platform admin, media, notifications, payments/webhooks, analytics, privacy export.
- Entry points: App Router pages/routes under `app/`, domain helpers under `lib/`, Prisma schema under `prisma/schema.prisma`.
- Deployment: Dockerfile with standalone Next output, Postgres, Tailscale-oriented deployment docs.
- Tests: broad tsx test suite covering CSRF, security headers, API contracts, calendar feeds, payments, privacy, notifications, release checks.

## Gap Analysis

- Security: CSP allows `unsafe-eval`; this should be development-only if it is required at all.
- Performance: public activity list/filter helpers perform several independent Prisma reads and can be cached or consolidated.
- Maintainability: many API route handlers repeat auth/input/audit patterns.
- Operations: health endpoints are simple and good; release gate should remain mandatory.
- Testing: strong coverage exists; keep small refactors behind existing tests.

## Sprint 01: Public Read-Model Cleanup

Status: done on continued-development.

Impact: medium performance improvement for public calendar/feed paths.
Risk: low; no response contract change.
Files likely touched:

- `lib/public-activities.ts`
- `app/api/public/calendar/route.ts`
- `lib/activity-service.ts`
- `lib/mock-activities.ts`

Tasks:

- Split public activity page loading from filter-option loading.
- Make calendar export use the activity-only query.

Verification:

```bash
npm run typecheck
npm run test
npm run build
```

Rollback: revert the sprint commit if production bundle requires eval; investigate dependency before restoring permanent `unsafe-eval`.

## Sprint 02: Public Activity Query Pass

Status: done on continued-development.

Consolidate duplicated Prisma reads in public activity filters and add measurements around public list endpoints.

## Sprint 03: Route Helper Extraction

Status: done on continued-development.

Extract shared auth/input/audit helpers for admin and business route handlers.

## Sprint 04: Deployment And Rollback Drill

Status: done on continued-development.

Ensure release docs define exact image/source rollback and database migration posture.
