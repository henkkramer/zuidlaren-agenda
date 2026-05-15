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
| 22 | Done | Structured Logging Redaction | `16`, `17`, `18` |
| 23 | Done | GitHub CI Release Gate | `18`, `21` |
| 24 | Done | Runtime Release Check Command | `21`, `16`, `18` |
| 25 | Done | HTTP Security Headers | `17`, `18`, `21` |
| 26 | Done | Same-Origin Mutation Guard | `17`, `18` |
| 27 | Done | Protected Mutation Coverage Expansion | `17`, `18`, `10` |
| 28 | Done | Audit Log Coverage Hardening | `17`, `14`, `21` |
| 29 | Done | Payment Webhook Contract Hardening | `13`, `17`, `18` |
| 30 | Done | Privacy Processor Register | `17`, `21`, `16` |
| 31 | Done | Media Upload Validation Coverage | `15`, `17`, `18` |
| 32 | Done | Account GDPR Request Validation | `17`, `18`, `21` |
| 33 | Done | Public Report Intake Foundation | `17`, `14`, `21` |
| 34 | Done | Notification Preference Validation | `12`, `17`, `18` |
| 35 | Done | Notification Campaign Request Validation | `12`, `17`, `18` |
| 36 | Done | Admin Status Validation Coverage | `14`, `17`, `18` |
| 37 | Done | Public Report UI Entry Points | `06`, `17`, `21` |
| 38 | Done | Admin Report Handling UX | `14`, `17`, `21` |
| 39 | Done | Admin Business Approval UX | `14`, `10`, `21` |
| 40 | Done | Admin Activity Moderation UX | `14`, `06`, `21` |

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

## Sprint 22 - Structured Logging Redaction

Status: Done

Goal:

Keep operational logs useful without leaking login links, emails, secrets, or message bodies.

Scope:

- Shared structured logging helper.
- Redaction for sensitive keys and email-like values.
- Auth, email, health, analytics, and admin bootstrap logging moved to structured logs.
- Automated redaction tests.

Acceptance:

- Sensitive values are redacted or masked in tested log records.
- Login URLs and email bodies are no longer written to logs.

## Sprint 23 - GitHub CI Release Gate

Status: Done

Goal:

Run the MVP release validation automatically on GitHub pull requests.

Scope:

- GitHub Actions workflow for lint, typecheck, tests, launch smoke, and build.
- CI-only environment values for build-time validation.
- Launch smoke guard that keeps the workflow present.
- CI release gate documentation.

Acceptance:

- Pull requests run the same validation commands used locally.
- Launch smoke fails if the CI workflow is removed or stops running required commands.

## Sprint 24 - Runtime Release Check Command

Status: Done

Goal:

Make deployed-host release verification repeatable for the operator.

Scope:

- `npm run release:check` command driven by `RELEASE_BASE_URL`.
- Shared release-check endpoint plan with tests.
- Launch smoke guard for the runtime check path.
- Release and operator docs updated.

Acceptance:

- Operator can validate the deployed reverse-proxy URL with one command.
- Automated tests cover the required runtime endpoint list.

## Sprint 25 - HTTP Security Headers

Status: Done

Goal:

Apply a baseline browser security policy to all app routes.

Scope:

- Shared security header policy.
- Next.js global header configuration.
- Tests for CSP, frame protection, content-type sniffing, referrer policy, and permissions policy.
- Launch smoke guard that keeps the shared policy wired into Next config.

Acceptance:

- All routes receive the shared security headers.
- Tests fail if the baseline security policy is weakened or disconnected.

## Sprint 26 - Same-Origin Mutation Guard

Status: Done

Goal:

Reduce CSRF risk on browser-authenticated state-changing MVP routes.

Scope:

- Shared same-origin mutation guard.
- Tests for origin and fetch-metadata behavior.
- Guard applied to account, attendance, and media mutations.
- Launch smoke guard for core account mutation coverage.

Acceptance:

- Cross-site browser mutations are rejected before session-backed state changes.
- Same-origin and configured app-origin mutations continue to work.

## Sprint 27 - Protected Mutation Coverage Expansion

Status: Done

Goal:

Apply same-origin mutation protection consistently to remaining protected MVP mutation routes.

Scope:

- Business activity create/edit/publish/unpublish mutations.
- Business member mutations.
- Business AI and notification-campaign mutations.
- Admin moderation, user, feature flag, category, report, business, and notification approval mutations.
- Launch smoke guard for business mutation coverage.

Acceptance:

- Browser-authenticated business and admin mutations reject cross-site requests before state changes.
- Public analytics and external webhook endpoints remain explicit exceptions.

## Sprint 28 - Audit Log Coverage Hardening

Status: Done

Goal:

Make sensitive audit-log coverage explicit and testable.

Scope:

- Canonical sensitive audit action registry.
- Audit coverage documentation.
- Tests that expected audit actions remain present in source files.
- Operator handoff updated with audit coverage reference.

Acceptance:

- Sensitive owner/admin/publish/moderation/notification/bootstrap actions are listed in one registry.
- `npm run test` fails if a registered audit action disappears from its source file.

## Sprint 29 - Payment Webhook Contract Hardening

Status: Done

Goal:

Keep the Mollie foundation testable without enabling live payments.

Scope:

- Deterministic Mollie webhook event normalization.
- Signature verification tests for raw and prefixed HMAC signatures.
- Payload summary truncation tests for provider-controlled webhook fields.
- Launch smoke guard for payment webhook helper coverage.

Acceptance:

- Invalid or missing webhook signatures stay rejected.
- Webhook parsing remains deterministic and safe to log before live payment processing is enabled.

## Sprint 30 - Privacy Processor Register

Status: Done

Goal:

Make the GDPR processor list explicit and reusable across public privacy copy and operational checks.

Scope:

- Shared privacy processor registry.
- Privacy page renders from the shared registry.
- Tests for required processor categories and active/prepared MVP status.
- Operator handoff updated with the registry maintenance rule.

Acceptance:

- Hosting/database, email, AI, analytics, and prepared Mollie processing are tracked in one source.
- Public privacy copy cannot silently drift from the maintained processor register.

## Sprint 31 - Media Upload Validation Coverage

Status: Done

Goal:

Make image upload safety rules directly testable without filesystem or database dependencies.

Scope:

- Extract pure media validation from local storage.
- Tests for supported JPEG, PNG, and WebP headers and dimensions.
- Tests for unsupported MIME types, extension mismatches, content mismatches, oversized files, and excessive dimensions.
- Launch smoke guard for the media validation helper.

Acceptance:

- Invalid or oversized image uploads are covered by fast automated tests.
- Local media storage still uses the same validation before writing files.

## Sprint 32 - Account GDPR Request Validation

Status: Done

Goal:

Make the account profile update path for GDPR deletion requests directly testable.

Scope:

- Shared profile input parser for display name, locale, and deletion request state.
- Tests for explicit deletion request handling, locale fallback, and display-name validation.
- Privacy export assertion for deletion request visibility.
- Launch smoke guard that keeps the profile route wired to the shared parser.

Acceptance:

- Deletion requests are only recorded for explicit user intent.
- Account profile validation behavior is covered without database dependencies.

## Sprint 33 - Public Report Intake Foundation

Status: Done

Goal:

Allow residents to submit constrained abuse/problem reports without opening an unrestricted spam path.

Scope:

- Public report submission route.
- Same-origin mutation guard and rate limit for report intake.
- Shared report input parser for reason, details, and optional activity slug.
- Tests for report input validation.
- Launch smoke guard for report parsing and throttling.

Acceptance:

- Report intake validates and trims user input before database writes.
- Report submissions are throttled and can be reviewed through the existing admin reports flow.

## Sprint 34 - Notification Preference Validation

Status: Done

Goal:

Keep opt-in notification settings explicit, sanitized, and testable.

Scope:

- Shared notification preference input parser.
- Tests for explicit boolean opt-ins.
- Tests for slug trimming, validation, deduplication, and caps.
- Route wiring through the shared parser while preserving database filtering for known categories and locations.
- Launch smoke guard for parser usage.

Acceptance:

- Notification opt-ins are only enabled by explicit boolean values.
- Category and location preference lists are sanitized before database filtering and persistence.

## Sprint 35 - Notification Campaign Request Validation

Status: Done

Goal:

Make business notification campaign request input explicit and testable before admin approval.

Scope:

- Shared notification campaign input parser.
- Tests for title, message, and optional activity input trimming and caps.
- Tests for minimum title and message requirements.
- Route wiring through the shared parser.
- Launch smoke guard for campaign parser usage.

Acceptance:

- Campaign requests validate and trim text before database writes.
- Business notification requests remain review-first and rate-limited.

## Sprint 36 - Admin Status Validation Coverage

Status: Done

Goal:

Keep admin moderation/status transitions constrained by shared, tested parsers.

Scope:

- Shared admin status parsers for activity, business, and report moderation.
- Shared report resolution trimming helper.
- Tests for allowed and rejected admin status values.
- Admin routes wired to the shared parsers.
- Launch smoke guard for admin activity parser usage.

Acceptance:

- Admin status routes only accept explicit allowlisted status values.
- Moderation validation behavior is covered without database dependencies.

## Sprint 37 - Public Report UI Entry Points

Status: Done

Goal:

Let residents report incorrect or problematic activity information from the public agenda without adding social or comment mechanics.

Scope:

- Compact report action in the public activity detail view.
- Reason selector and optional explanation field.
- Submission to the existing rate-limited public report intake endpoint.
- Success and error states with calm resident-facing wording.
- Launch smoke guard that keeps the public UI wired to report intake.

Acceptance:

- Residents can report a published activity from the public detail view.
- Report submissions include the activity slug and use the existing `POST /api/reports` route.
- The card grid and mobile-first agenda layout remain unchanged.

## Sprint 38 - Admin Report Handling UX

Status: Done

Goal:

Make submitted activity reports actionable from the platform admin screen without requiring manual database edits.

Scope:

- Replace the static admin report list with a client-side moderation panel.
- Show report reason, details, activity, reporter label, creation date, status, and resolution.
- Add reviewed, dismissed, and reopen actions wired to the existing audited admin report endpoint.
- Keep success/error feedback local to the admin card.
- Add a launch smoke guard for admin report UI endpoint wiring.

Acceptance:

- Admins can mark reports as handled, dismiss them, or reopen them from `/admin`.
- Report moderation continues to use `PATCH /api/admin/reports/[reportId]` and existing audit logging.
- The admin dashboard remains responsive on narrow screens.

## Sprint 39 - Admin Business Approval UX

Status: Done

Goal:

Close the remaining admin operation gap for approving and suspending businesses from the dashboard.

Scope:

- Replace the static business status list with an actionable admin component.
- Add approve, suspend, and reset-to-pending actions.
- Wire actions to the existing audited admin business status endpoint.
- Add a launch smoke guard for admin business UI endpoint wiring.

Acceptance:

- Admins can approve, suspend, or reset businesses from `/admin`.
- Business status changes continue to use `PATCH /api/admin/businesses/[businessId]` and existing audit logging.

## Sprint 40 - Admin Activity Moderation UX

Status: Done

Goal:

Close the remaining admin operation gap for publishing, hiding, and expiring activities from the dashboard.

Scope:

- Replace the static activity status list with an actionable admin component.
- Add publish, hide, and expire actions.
- Wire actions to the existing audited admin activity status endpoint.
- Add a launch smoke guard for admin activity UI endpoint wiring.

Acceptance:

- Admins can publish, hide, or expire activities from `/admin`.
- Activity status changes continue to use `PATCH /api/admin/activities/[activityId]` and existing audit logging.
