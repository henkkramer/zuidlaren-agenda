# 21 - MVP Scope and Release Plan

## Goal

Define the build order and release gates for the strict MVP.

## MVP Release Gates

Gate 1: Local foundation

- Next.js app runs.
- Docker Compose works.
- PostgreSQL and Prisma migrations work.
- Health endpoint works.

Gate 2: Public agenda

- Seeded activities appear.
- Cards are responsive.
- Filters work.
- Activity detail works.
- Visual shell follows `example-UI.png` and `ui-build-instructions.md` closely enough to validate the desired look before backend depth.

Gate 3: Users and attendance

- Email login works.
- User can mark "Ik ga".
- Attendance is private by default.
- Personal agenda works.

Gate 4: Business publishing

- Admin-approved business exists.
- Owner can create/edit/publish activity.
- Employee role is restricted.
- Publish actions are audited.

Gate 5: Platform admin

- Admin can manage users, businesses, activities, categories, reports, feature flags.
- Admin can unpublish activity.
- Audit logs are visible.

Gate 6: MVP hardening

- Validation and permissions tested.
- Docker deployment tested over Tailscale.
- Basic privacy/legal pages drafted.
- Backup/restore path documented.

## Out of MVP

- Live payments.
- Web push.
- Native apps.
- Automated scraping.
- Comments/likes/followers/chat.
- Formal reservations.
- Advanced recurring events.

## Launch Checklist

- UI checked against `implementation-plan/example-UI.png`.
- `npm run typecheck` passes.
- `npm run lint` passes.
- `npm run test` passes.
- `npm run build` passes.
- E2E smoke path passes.
- Admin account exists.
- Seed categories/locations are correct.
- Privacy/cookie/business terms drafts exist.
- Tailscale access confirmed.
- Backup tested.

## Acceptance Criteria

- The MVP is usable by a small controlled group in Zuidlaren.
- Platform owner can operate it without routine database edits.
- The product still feels like an agenda, not a social network.
