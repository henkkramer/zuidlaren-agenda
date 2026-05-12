# 01 - Architecture Decision Record

## Goal

Record fixed architecture decisions for the MVP and the rationale behind them.

## Decisions

| Topic | Decision | Rationale |
| --- | --- | --- |
| App framework | Next.js App Router | Strong SSR/SEO, good PWA path, efficient full-stack MVP |
| Language | TypeScript | Safer domain model and API contracts |
| Styling | Tailwind CSS + shadcn/ui | Fast, accessible, consistent UI primitives |
| Backend | Next.js route handlers/server actions | Keeps MVP simple while supporting native-app APIs later |
| Domain organization | Service layer | Prevents business logic from being trapped in UI handlers |
| Database | PostgreSQL | Fits relational data, roles, search, payments, audit logs |
| ORM | Prisma | Productive migrations, schema clarity, good TypeScript support |
| Auth | Auth.js email login | Self-hosted, low lock-in, OAuth extensible |
| Jobs | pg-boss preferred | PostgreSQL-backed, avoids Redis in first deployment |
| Payments | Mollie later | Strong Dutch/iDEAL fit |
| AI | Provider-agnostic interface | Allows OpenAI/other providers without rewriting app code |
| Media | Local volume first, S3-compatible abstraction later | Simple local MVP without blocking scale |
| Deployment | Docker Compose | Matches Linux/Tailscale target and future production path |

## Application Boundaries

- `app/` contains routes, pages, and route handlers.
- `components/` contains reusable UI.
- `lib/domain/` contains service-level business logic.
- `lib/auth/` contains session and auth helpers.
- `lib/db/` contains Prisma client and query helpers.
- `lib/permissions/` contains RBAC checks.
- `lib/validation/` contains shared schemas.
- `prisma/` contains schema, migrations, and seed data.

## API Strategy

Use route handlers for all behavior needed by future mobile clients. Server actions may be used for forms, but must call the same service layer as APIs.

## Non-Goals

- Separate NestJS/Fastify backend in MVP.
- Microservices.
- Hosted-only architecture.
- Vendor-specific AI implementation in domain code.

## Risks

- Next.js server actions can blur boundaries. Mitigation: route handlers and services remain the source of truth.
- Prisma migrations require discipline. Mitigation: every schema change is paired with migration and seed update.
- Full admin backend can grow too large. Mitigation: strict operational-basics MVP.

## Acceptance Criteria

- A new engineer can identify where UI, API, services, validation, permissions, and schema code belong.
- The architecture supports future native apps through route handlers.

