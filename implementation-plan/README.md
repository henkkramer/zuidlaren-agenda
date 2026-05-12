# Zuidlaren Agenda Webapp - Master Implementation Plan

## Executive Summary

Zuidlaren Agenda is a mobile-first local activity agenda for Zuidlaren, The Netherlands. The public product is a clean scrollable feed of activity cards where residents can discover events, open details, and mark "Ik ga". The product must stay trustworthy and local: no comments, likes, followers, public social feeds, chat, or popularity mechanics.

The first deliverable is a strict MVP that proves the core loop:

- Residents browse and filter local activities.
- Users create an account and keep a personal agenda.
- Attendance is private by default, with explicit per-event public visibility.
- Approved local businesses and organizations publish activities.
- Platform admins control businesses, activities, categories, reports, and feature flags.

## Fixed Decisions

| Area | Decision |
| --- | --- |
| Product UI language | Dutch |
| Planning and implementation docs | English |
| Frontend | Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Next.js route handlers/server actions with a domain service layer |
| Database | PostgreSQL from day one |
| ORM | Prisma |
| Auth | Auth.js email login for MVP, OAuth later |
| Deployment | Docker Compose on local Linux first |
| Test hostname | `mb-linux.sailfish-musical.ts.net` |
| Payments | Mollie as preferred future provider |
| AI | Provider-agnostic app interface, first provider configured later |
| Events | Manual entry first, admin import next, scraping/calendar ingestion later |
| Business onboarding | Admin-approved |
| Attendance visibility | Private by default |
| MVP admin depth | Operational basics |

## Product Vision

The app should become the central agenda for Zuidlaren without becoming a social network. It should feel local, premium, fast, accessible, and calm. The public feed is the primary experience. Business and admin tools exist to keep the public feed accurate, high-quality, and financially sustainable.

Core Dutch UI terms:

- `Agenda`
- `Vandaag`
- `Morgen`
- `Dit weekend`
- `Ik ga`
- `Misschien`
- `Niet meer gaan`
- `Alleen prive opslaan`
- `Zichtbaar voor anderen`
- `Meld probleem`
- `Organisator`
- `Locatie`
- `Gratis`
- `Betaald`

## Recommended Architecture

Use a modular monolith in Next.js for MVP:

- App Router pages for public, account, business, and admin surfaces.
- Route handlers for API endpoints needed by future native apps.
- Server actions only where they simplify form handling without hiding domain logic.
- Domain services for activities, attendance, business permissions, notifications, AI, media, and audit logs.
- Prisma migrations from the first commit.
- PostgreSQL-backed job queue with `pg-boss` unless implementation constraints force a temporary cron-style worker.

The modular monolith keeps delivery fast while preserving a path to a separate backend later.

## UX Recommendation

Public experience:

- First screen is the agenda feed, not a landing page.
- Follow `implementation-plan/example-UI.png` and `implementation-plan/ui-build-instructions.md` as the visual source of truth for style, screen composition, and component behavior. Do not implement the reference as literal phone mockups or device frames.
- Use the "Zuidlaren Agenda - Premium Local Cards" direction: warm cream background, deep green/orange accents, editorial serif headings, clean sans-serif UI text, and large image-rich activity cards.
- Mobile-first cards with dominant banner image, large overlaid date badge, title, location, time, category chips, and short description.
- Desktop must be a real production layout: agenda feed as the primary column, with detail, personal agenda, filters, and organization/admin panels arranged as supporting panels.
- Cards expand inline or open a detail sheet/page depending on viewport.
- Filters are sticky and visible as removable chips.
- Feed state is reflected in the URL.

Business backend:

- Quiet dashboard layout, not marketing-style.
- Activity list, draft/published status, create/edit form, AI helper, notification controls, employees, settings.
- Employees do not see billing or owner-level settings by default.

Platform admin:

- Operational tables and detail views for users, businesses, activities, categories, reports, audit logs, and feature flags.
- Finance, AI cost, and advanced system dashboards are planned but not required for strict MVP.

## Data Model Overview

Core MVP models:

- `User`, `UserProfile`, `Session`, Auth.js tables.
- `Business`, `BusinessMember`, `Role`, `Permission`.
- `Activity`, `ActivityCategory`, `ActivityType`, `Location`, `MediaAsset`.
- `Attendance` with `status` and `visibility`.
- `NotificationPreference`.
- `AuditLog`, `Report`, `FeatureFlag`.
- `AiPromptTemplate`, `AiUsageLog` as provider-agnostic foundations.
- `PaymentCustomer`, `PaymentSubscription`, `PaymentTransaction`, `InvoiceReference` as inactive foundations for Mollie.

Important indexes:

- Published activity feed: status, start time, category, location.
- Attendance uniqueness: user plus activity.
- Business membership: user plus business.
- Audit lookup: actor, target, created time.

## API Design Overview

Public:

- `GET /api/activities`
- `GET /api/activities/:id`
- `GET /api/categories`
- `GET /api/locations`

User:

- `GET /api/me`
- `PATCH /api/me/profile`
- `GET /api/me/agenda`
- `POST /api/activities/:id/attendance`
- `PATCH /api/activities/:id/attendance`
- `DELETE /api/activities/:id/attendance`
- `GET/PATCH /api/me/notification-preferences`

Business:

- `GET /api/businesses/:businessId/activities`
- `POST /api/businesses/:businessId/activities`
- `PATCH /api/businesses/:businessId/activities/:activityId`
- `POST /api/businesses/:businessId/activities/:activityId/publish`
- `POST /api/businesses/:businessId/activities/:activityId/unpublish`
- `POST /api/businesses/:businessId/ai/activity-assist`
- `GET/POST/PATCH /api/businesses/:businessId/members`

Admin:

- `GET /api/admin/users`
- `GET/PATCH /api/admin/businesses`
- `GET/PATCH /api/admin/activities`
- `GET/POST/PATCH /api/admin/categories`
- `GET/PATCH /api/admin/reports`
- `GET /api/admin/audit-logs`
- `GET/PATCH /api/admin/feature-flags`

## Security, GDPR, and Privacy

Defaults:

- Store only data needed for the feature.
- Attendance is private unless the user opts in per event.
- Notifications are opt-in and rate-limited.
- No social graph.
- Log sensitive admin and business actions.
- Validate all input with shared schemas.
- Verify future Mollie webhooks.
- Validate uploaded files by type, size, dimensions, and extension.
- Keep AI prompts and generated text review-only; never auto-publish AI output.

Legal documents needed before public launch:

- Privacy policy.
- Cookie policy.
- Terms for businesses.
- Data processor register for email, hosting, AI, analytics, and payment providers.

## Monetization and Payments

MVP should not depend on payments. The first commercial path is:

1. Free basic publishing for approved local organizations.
2. Paid promoted event or paid last-minute notification.
3. Business packages once usage is proven.

Prefer Mollie for Dutch local business fit, iDEAL support, subscriptions, and straightforward payment links/webhooks. Store internal billing records and webhook event logs from the start, but do not require payment UI in the strict MVP.

## AI Integration

Build a provider-agnostic AI service:

- Prompt templates stored in the database with versioning.
- Actions: improve text, shorten text, make family-friendly, make formal, suggest tags, suggest category, check missing info, create banner prompt.
- Log usage by business, user, action, prompt version, token/cost estimate, and provider response metadata.
- AI suggestions require user review before saving or publishing.

## Local Linux and Tailscale Deployment

Use Docker Compose for:

- `web`
- `postgres`
- optional `worker`
- optional development database viewer

Expose the app for local testing first over HTTP, then through Tailscale HTTPS or reverse proxy at:

```text
https://mb-linux.sailfish-musical.ts.net
```

Document `.env.example`, migrations, seed commands, health checks, backups, and restore steps.

## Phased Roadmap

MVP:

- Public agenda.
- Activity cards.
- Filters/search.
- Auth and users.
- Attendance and personal agenda.
- Business accounts and role separation.
- Business activity creation.
- Basic platform admin.
- Docker Compose, PostgreSQL, Prisma.
- Basic AI text assistant architecture.

v1:

- Email notifications.
- Admin import workflow.
- Better analytics.
- Media polish.
- Business notification requests.
- Mollie sandbox integration.

v2:

- Paid notifications.
- Web push.
- Business subscriptions.
- Recurring events.
- Public API hardening for mobile clients.

Future:

- Native iOS/Android apps.
- Calendar feeds.
- Moderated scraping/calendar ingestion.
- Advanced accounting integrations.
- Friend-based private discovery only if it can be built without social-network mechanics.

## Start Instructions for Codex

Implement sequentially from the numbered files. Do not skip ahead to payments, native apps, scraping, or advanced notifications before the strict MVP is complete. Each phase must leave the app runnable and testable.

Recommended first coding sequence:

1. `02-local-development-and-docker.md`
2. Build the static visual shell from `ui-build-instructions.md`.
3. `05-public-agenda-feed.md`
4. `06-activity-card-ui.md`
5. `07-filtering-and-search.md`
6. `08-user-personal-agenda.md`
7. `03-database-schema.md`
8. `04-authentication-and-users.md`
9. `09-business-backend.md`
10. `10-business-roles-and-permissions.md`
11. `14-platform-admin-backend.md`
