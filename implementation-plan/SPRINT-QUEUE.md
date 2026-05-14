# Zuidlaren Agenda - Sprint Queue

This queue is the single execution sequence for the existing implementation plan. It does not replace the numbered plan files; each sprint references the relevant files and should be executed in order.

## Queue Status

| Sprint | Status | Name | Main Plan Files |
| --- | --- | --- | --- |
| 0 | Done | Planning and UI Direction | `README.md`, `00`, `01`, `06`, `21`, `ui-build-instructions.md` |
| 1 | Done | Public Agenda UI Cleanup | `05`, `06`, `07`, `21` |
| 2 | Done | Local Dev, Docker, and Project Hygiene | `02`, `18`, `19` |
| 3 | Done | Public Feed Data Model and Mock-to-Service Refactor | `03`, `05`, `07` |
| 4 | Done | Database, Prisma, Seed Data | `03`, `02`, `18` |
| 5 | Done | Authentication and User Profiles | `04`, `17`, `18` |
| 6 | Done | Attendance and Personal Agenda | `08`, `04`, `17`, `18` |
| 7 | Done | Business Backend Foundation | `09`, `10`, `17`, `18` |
| 8 | Done | Business Activity Editor and Live Preview | `09`, `06`, `10`, `18` |
| 9 | Done | Platform Admin Basics | `14`, `10`, `17`, `18` |
| 10 | Done | Media Storage and Uploads | `15`, `09`, `17`, `18` |
| 11 | Done | Filtering, Search, and URL State | `07`, `05`, `18` |
| 12 | Done | AI Card Assistant Foundation | `11`, `09`, `16`, `17`, `18` |
| 13 | Done | Notification Preferences and Email Foundation | `12`, `04`, `16`, `17`, `18` |
| 14 | Done | Analytics and Observability | `16`, `17`, `18`, `19` |
| 15 | Done | Payments and Billing Foundations | `13`, `14`, `17`, `18` |
| 16 | Done | Tailscale Linux Deployment Hardening | `19`, `02`, `18` |
| 17 | Done | MVP Release Hardening | `17`, `18`, `21` |
| 18 | Done | Mobile App Readiness | `20`, `05`, `08`, `12` |
| 19 | Done | MVP Launch Readiness | `21`, `18`, `17` |
| 20 | Done | Operator Handoff and Admin Bootstrap | `21`, `14`, `17` |
| 21 | Done | Permission and Validation Test Coverage | `18`, `10`, `17` |

## Sprint 0 - Planning and UI Direction

Status: Done

Delivered:

- Master implementation plan.
- Numbered implementation-plan files.
- UI reference added as visual source of truth.
- Initial Next.js prototype.
- Dev server on port `3088`.

Acceptance:

- Planning direction is documented.
- Mobile visual style is validated enough to continue.

## Sprint 1 - Public Agenda UI Cleanup

Status: Done

Goal:

Turn the current prototype into a clean, maintainable public agenda UI slice.

Scope:

- Remove mockup/device-frame leftovers.
- Rename `PhoneShell`, `showcase-grid`, `phone-frame`, and similar prototype names to product layout names.
- Remove hidden duplicate desktop/sidebar code not used by the current one-block desktop layout.
- Split the large component into smaller files:
  - mock activity data
  - date helpers
  - activity card
  - filter controls
  - mobile header
  - bottom navigation
  - detail view
- Preserve current mobile look.
- Keep desktop as one centered agenda block.
- Ensure card tap/detail/back behavior works cleanly.

Acceptance:

- `npm run lint` passes.
- `npm run typecheck` passes.
- `npm run build` passes.
- App still runs on `http://localhost:3088`.
- No visible duplicate desktop detail panel.

## Sprint 2 - Local Dev, Docker, and Project Hygiene

Status: Done

Goal:

Make the scaffold reproducible and ready for backend work.

Scope:

- Add `.env.example`.
- Add Docker Compose for app and PostgreSQL.
- Add project README with local commands.
- Add health endpoint.
- Confirm dev, build, lint, typecheck commands.

Acceptance:

- App starts locally without hidden setup.
- Docker Compose starts required local services.
- Health endpoint responds.

## Sprint 3 - Public Feed Data Model and Mock-to-Service Refactor

Status: Done

Goal:

Prepare the public agenda for database-backed activities without changing the UI.

Scope:

- Define frontend activity types.
- Move mock activities behind a service boundary.
- Add filter/query shape matching planned API.
- Keep current UI consuming a feed service rather than inline data.

Acceptance:

- UI behavior remains unchanged.
- Mock data can later be replaced by API/database data with minimal UI changes.

## Sprint 4 - Database, Prisma, Seed Data

Status: Done

Goal:

Introduce PostgreSQL and Prisma schema for the strict MVP.

Scope:

- Prisma schema for users, businesses, activities, categories, locations, attendance, audit logs, reports, feature flags.
- Initial migrations.
- Seed realistic Zuidlaren categories, locations, businesses, and activities.

Acceptance:

- Migration applies cleanly.
- Seed creates visible public activities.
- Build and typecheck pass.

## Sprint 5 - Authentication and User Profiles

Status: Done

Goal:

Add user accounts with Auth.js email login.

Scope:

- Auth.js setup.
- User profile page.
- Session-aware UI shell.
- Protected account routes.

Acceptance:

- User can sign in locally.
- Anonymous users can still browse the agenda.
- Protected account APIs reject anonymous access.

## Sprint 6 - Attendance and Personal Agenda

Status: Done

Goal:

Implement `Ik ga`, private-by-default attendance, and personal agenda.

Scope:

- Attendance data model and APIs.
- Save/going actions.
- Private/public visibility toggle.
- `/mijn-agenda` view.

Acceptance:

- User can mark and remove attendance.
- Default visibility is private.
- Personal agenda shows selected activities.

## Sprint 7 - Business Backend Foundation

Status: Done

Goal:

Add approved business accounts and role-aware access.

Scope:

- Business dashboard shell.
- Business owner and employee membership.
- Permission helper.
- Admin-approved business status.

Acceptance:

- Owner and employee permissions differ.
- Unapproved businesses cannot publish.
- Business routes are protected.

## Sprint 8 - Business Activity Editor and Live Preview

Status: Done

Goal:

Allow approved businesses to create and publish activities.

Scope:

- Activity create/edit form.
- Required validation.
- Draft/published/unpublished states.
- Live public card preview.

Acceptance:

- Owner can create, save draft, and publish.
- Employee can publish only with permission.
- Published activities appear in public feed.

## Sprint 9 - Platform Admin Basics

Status: Done

Goal:

Build operational admin tools for MVP trust and moderation.

Scope:

- Admin access control.
- Users.
- Businesses and approval.
- Activities and unpublish action.
- Categories/locations.
- Reports.
- Audit logs.
- Feature flags.

Acceptance:

- Admin can approve business.
- Admin can unpublish activity.
- Sensitive admin actions create audit logs.

## Sprint 10 - Media Storage and Uploads

Status: Done

Goal:

Support banners and logos safely.

Scope:

- Local media storage.
- Upload endpoint.
- File validation.
- Media metadata.
- Business logo and activity banner usage.

Acceptance:

- Valid image uploads work.
- Invalid or oversized uploads are rejected.
- Activities can use uploaded banners.

## Sprint 11 - Filtering, Search, and URL State

Status: Done

Goal:

Make public filters functional and shareable.

Scope:

- Date/category/type/location filters.
- Search input.
- URL-backed filter state.
- Server-side filtering.
- Pagination/load-more behavior.

Acceptance:

- Filter URLs are shareable.
- Combined filters return correct activities.
- Invalid filters are handled cleanly.

## Sprint 12 - AI Card Assistant Foundation

Status: Done

Goal:

Add provider-agnostic AI assistance for activity text.

Scope:

- AI provider interface.
- Prompt templates.
- Usage logs.
- Business editor AI actions.
- Feature flag.

Acceptance:

- Authorized business user can request suggestions.
- Suggestions are review-only.
- Usage is logged.

## Sprint 13 - Notification Preferences and Email Foundation

Status: Done

Goal:

Add opt-in notification foundations without business spam.

Scope:

- Notification preferences.
- Email provider abstraction.
- Campaign and delivery models.
- Admin-controlled sending foundation.

Acceptance:

- Opt-out users are excluded.
- Delivery attempts are logged.
- Businesses cannot send unrestricted campaigns.

## Sprint 14 - Analytics and Observability

Status: Done

Goal:

Add privacy-conscious operational metrics.

Scope:

- Activity view/click counters.
- Attendance metrics.
- AI usage metrics.
- Structured logs.
- Readiness health endpoint.

Acceptance:

- No invasive tracking.
- Admin/operator can see basic platform health and usage.

## Sprint 15 - Payments and Billing Foundations

Status: Done

Goal:

Prepare for Mollie without making payments required for MVP.

Scope:

- Payment placeholder models.
- Webhook event log.
- Billing admin placeholders.
- Mollie sandbox documentation.

Acceptance:

- MVP remains usable without payments.
- Future payment integration has clear data foundations.

## Sprint 16 - Tailscale Linux Deployment Hardening

Status: Done

Goal:

Make local Linux deployment repeatable over Tailscale.

Scope:

- Production Docker build.
- Tailscale/reverse proxy notes.
- Backup and restore commands.
- Health checks.

Acceptance:

- App can be tested through Tailscale.
- Database and media backup path is documented and tested.

## Sprint 17 - MVP Release Hardening

Status: Done

Goal:

Prepare controlled MVP use.

Scope:

- Accessibility pass.
- Privacy/legal page drafts.
- Error/empty/loading states.
- Permission and privacy test pass.
- Seed data cleanup.

Acceptance:

- MVP can be used by a controlled local test group.
- Owner can operate normal tasks without database edits.

## Sprint 18 - Mobile App Readiness

Status: Done

Goal:

Prepare for native app work after web MVP.

Scope:

- Stabilize API contracts.
- Review auth strategy for mobile.
- Plan mobile push.
- Document iOS/Android reuse boundaries.

Acceptance:

- Native app work can start without rewriting core backend behavior.

## Sprint 19 - MVP Launch Readiness

Status: Done

Goal:

Prepare the controlled MVP release gate.

Scope:

- Launch readiness documentation.
- Release health endpoint.
- Deterministic launch smoke command.
- Reverse-proxy production assumption documented.

Acceptance:

- Release checks can run without database edits.
- Operator has one checklist for controlled MVP rollout.

## Sprint 20 - Operator Handoff and Admin Bootstrap

Status: Done

Goal:

Make first-admin setup and controlled MVP operation repeatable.

Scope:

- Idempotent admin bootstrap command.
- Operator handoff runbook.
- Launch smoke guard for the admin bootstrap path.
- Release documentation updated.

Acceptance:

- Owner can create or promote the first admin without manual database edits.
- Launch smoke fails if the operator bootstrap path is removed.

## Sprint 21 - Permission and Validation Test Coverage

Status: Done

Goal:

Cover critical MVP permission, validation, filter, and throttling behavior with fast automated tests.

Scope:

- Pure business permission rule helper.
- Owner/employee publish and member-management tests.
- Business activity input validation tests.
- Public filter/query helper tests.
- Rate-limit helper tests.

Acceptance:

- `npm run test` covers critical permission and validation behavior without a live database.
- Route permission code uses the same tested rule helper.
