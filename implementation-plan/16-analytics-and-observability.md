# 16 - Analytics and Observability

## Goal

Track useful operational and business metrics without invasive user tracking.

## Scope

- Internal activity analytics.
- Basic app health.
- Error logging.
- Privacy-friendly product metrics.

## Non-Goals

- Behavioral ad tracking.
- Cross-site tracking.
- Complex data warehouse.

## Metrics

Track:

- Activity views.
- Attendance clicks.
- Filter usage.
- Business activity counts.
- Notification opt-in counts.
- Admin moderation actions.
- AI usage counts and cost estimates.

Do not track:

- Third-party advertising identifiers.
- Personal browsing profiles.
- Unnecessary precise location.

## Technical Decisions

- Start with internal event counters.
- Consider Plausible or Umami later.
- Add structured server logs.
- Add `/api/health` and optional `/api/health/ready`.

## Tests

- Health endpoint works.
- Analytics events do not require cookies unless explicitly consented.
- Sensitive data is not written to logs.

## Acceptance Criteria

- Platform owner can see whether the MVP is used.
- Analytics remain GDPR-conscious.


## Performance Refactor Observability

The public agenda now records aggregate, privacy-friendly Web Vitals through `/api/analytics/web-vitals`. A small client reporter sends only the metric name, rating, current path, and a coarse value bucket; raw user identity, cookies, and full URLs are not stored. These events are aggregated as the `web_vital` metric and shown in the admin analytics card next to existing activity, filter, attendance, and calendar counters.

Server-side Prisma query warnings are enabled outside production. Queries above 100 ms emit a structured `prisma.slow_query` warning, and repeated identical queries emit `prisma.repeated_query` when the same normalized query appears five times in one process. This is intended as a development and CI signal for N+1 regressions, not as a production query trace.

The homepage uses Suspense boundaries for cached filter options and the cached activity feed so the static shell and mobile header can stream before slower data sections finish. Public feed and filter-option caches remain tag-invalidated by activity mutations.

`npm run perf:budget` is available to run after `npm run build`. The budget script reads `.next/app-build-manifest.json` and fails when key app routes exceed their JavaScript gzip budgets. Lighthouse CI can be layered on top when a stable preview URL and seeded database are available; the current in-repo guardrail is dependency-free and deterministic for pull requests.
