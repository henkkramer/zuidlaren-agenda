# 22 — Performance & Structural Refactor Plan

## Executive Summary

The Zuidlaren Agenda codebase is functionally complete but carries structural debt that hurts both per-request latency and infrastructure cost. The public homepage — the single most-visited route — re-runs ~7 Prisma queries plus a write on every request, ships the entire UI shell as a client bundle, and serves full-resolution Unsplash images without `next/image`. Admin endpoints return whole-row payloads with no `select` discipline. Notification recipient resolution filters in JavaScript instead of SQL, which will not scale past a few hundred opted-in users.

This plan groups the fixes into **five sprints (~2 weeks each)** ordered by ROI: cache the hot path first, then trim client/server boundaries, then harden the data layer, then polish bundle/build, then close out infra/observability. Each sprint is independently shippable behind a feature flag where risk warrants it.

**Expected aggregate impact when all sprints land:**
- **TTFB on `/`**: ~600–900 ms → ~80–150 ms (cached) / ~250 ms (cold) — **~5–8× faster**
- **Homepage payload (JS + image bytes)**: ~70% smaller on mobile (~1.2 MB → ~350 KB)
- **DB queries per homepage render**: 7 → 0–1 (cache hit) / 2 (cold)
- **Admin dashboard load**: ~1.5–2 s → ~400–600 ms
- **Notification send (1k recipients)**: O(N) memory + 1 query → bounded memory + 1 indexed query
- **Docker image size**: ~10–20% smaller
- **LCP (mobile, 4G)**: ~3.5 s → ~1.5 s

---

## Guiding Principles

1. **Cache before optimizing queries.** A cached query is faster than any optimized query.
2. **RSC by default, client islands by exception.** Every `"use client"` is a chunk paid for by every visitor.
3. **`select` is mandatory for any query feeding a list view.** `include` is for detail views.
4. **Predicates belong in SQL, not Array.filter.**
5. **No regressions in feature behavior** — every refactor lands behind type-checked contracts and existing tests.

---

## Sprint 1 — Cache the Hot Path (Highest ROI)

Status: done on refactor.

**Goal:** Cut public homepage TTFB and DB load by an order of magnitude without changing UI.

### Workstreams
1. **ISR / `unstable_cache` for the public feed**
   - `app/page.tsx`: remove `dynamic = "force-dynamic"`, switch to `export const revalidate = 60`.
   - `lib/public-activities.ts`: wrap `getPublicFilterOptions` in `unstable_cache` with tags `["filter-options"]`, TTL 300 s.
   - Add `revalidateTag("filter-options")` calls in publish/unpublish/edit/admin-import handlers (`app/api/businesses/[businessId]/activities/[activityId]/publish/route.ts` etc.).
   - Wrap `getPublicActivityFeed` in `unstable_cache` keyed on a stable hash of filter state; tag `["activity-feed"]`, TTL 60 s.

2. **Move blocking analytics out of render**
   - `app/page.tsx:17`: replace `await recordAnalyticsMetric(...)` with `after(() => recordAnalyticsMetric(...))` from `next/server`.
   - Same treatment in `app/api/analytics/events/route.ts`.

3. **Collapse the 5-query analytics aggregate**
   - `lib/analytics-snapshot.ts:32-51`: one `groupBy({ by: ["metric"], where: { day: { gte: last30Days } }, _sum: { count: true } })`; pivot in JS.

### Acceptance
- Lighthouse Performance score on `/` (mobile, throttled 4G) ≥ 90.
- `/` cold-hit TTFB ≤ 300 ms in staging; warm hit ≤ 100 ms.
- Admin snapshot endpoint round-trips drop from 11 to 7.

### Expected Improvement
- Homepage TTFB: **−70 to −85%**
- DB queries per `/` request: **7 → 0 (cache hit) / 2 (miss)**
- Admin analytics endpoint: **−30%**

---

## Sprint 2 — Server/Client Boundary Cleanup

Status: done on refactor.

**Goal:** Stop shipping the whole shell to the browser. Move presentation back to RSC; keep only true interaction in client islands.

### Workstreams
1. **Decompose `ZuidlarenAgendaShell`**
   - Convert `components/zuidlaren-agenda-shell.tsx` into a server component that renders static chrome + the activity list.
   - Extract the selected-activity modal into a route-driven detail view at `app/activity/[slug]/page.tsx` (Parallel Routes / Intercepting Routes pattern). Eliminates the `useState<Activity | null>` and the corresponding client island wrap.
   - Keep `FilterControls`, `ActivityReportForm`, `AccountPanel`, `BusinessActivityEditor` as client components (they need state).

2. **Convert banners to `next/image`**
   - `components/activity-card.tsx:52` and `components/activity-detail-view.tsx:41`: replace `style={{ backgroundImage: ... }}` with `<Image fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />`.
   - Update card CSS to use `position: relative` containers; tag image with `priority` on the first 2 LCP candidates.
   - Add `unoptimized` fallback only for the editor live preview.

3. **`next/font` for typography**
   - `app/layout.tsx`: add `next/font/google` (or `localFont` if already self-hosted). Remove any `@import url(...)` from `globals.css`.

### Acceptance
- Client JS for `/` route ≤ 120 KB gzip (Next bundle analyzer).
- LCP image on mobile ≤ 80 KB (AVIF/WebP via image optimizer).
- All existing Playwright/RTL tests pass.

### Expected Improvement
- Client bundle for `/`: **−40 to −60%**
- Image bytes per card grid: **−80 to −90%**
- LCP (mobile): **−40 to −55%**

---

## Sprint 3 — Data Layer Hardening

**Goal:** Make Prisma usage predictable: `select` discipline, push filters into SQL, add missing indexes, paginate admin endpoints.

### Workstreams
1. **`select` discipline for list views**
   - Audit and convert (introduce `lib/prisma-selects.ts` exporting reusable `Prisma.ActivitySelect` fragments):
     - `app/admin/page.tsx:90` (activities)
     - `app/api/admin/activities/route.ts:12`
     - `app/business/[businessId]/page.tsx:57` (also push `take: 12` into query)
     - `app/api/me/agenda/route.ts:19` and `app/mijn-agenda/page.tsx:23` (dedupe — share a single `lib/personal-agenda.ts`)
     - `app/api/me/export/route.ts:13` (legitimate `include`, but `select` the user fields needed)

2. **Push notification-recipient filtering into SQL**
   - `lib/notification-campaigns.ts:32-46`: rewrite `findCampaignRecipients` so category/location predicates are SQL `AND`/`OR` against `NotificationPreference.categorySlugs` / `locationSlugs` (use `has` / `isEmpty`).
   - Return only `{ id, email, name }`; the campaign send path doesn't need full user rows.

3. **Pagination for admin lists**
   - Generalize `lib/public-activity-pagination.ts` into a small cursor helper and reuse for:
     - `app/api/admin/businesses/route.ts` (currently no `take`)
     - `app/api/admin/activities/route.ts` (currently `take: 200`)
     - `app/api/admin/reports/route.ts` (currently `take: 100`)

4. **Missing indexes**
   - Add to `prisma/schema.prisma`:
     - `@@index([status, organizerName])` on `Activity` (filter + distinct in `getPublicFilterOptions`)
     - `@@index([status, indoorOutdoor])` on `Activity`
   - Migration generated; verify with `EXPLAIN ANALYZE` on staging.

5. **Single-query permission check**
   - `lib/business-permissions.ts:29-73`: collapse business + membership lookup into one `prisma.business.findFirst({ include: { members: { where: { userId } } } })`.

6. **Trim full-table counts**
   - `lib/analytics-snapshot.ts:57,68`: window the unbounded `attendance.count()` and `notificationDelivery.groupBy` to last 30 days, or back them with a rollup table.

### Acceptance
- `pnpm prisma format && prisma migrate dev` clean.
- p95 query time on `getPublicActivityFeed` ≤ 30 ms (logged via Prisma `$on('query')`).
- Synthetic 1k-recipient campaign send: total query time ≤ 200 ms.

### Expected Improvement
- Admin dashboard TTFB: **−40 to −60%**
- Notification recipient resolution: **O(users) memory → O(matched users)**, single indexed query
- Mean Prisma response payload size: **−50 to −70%** on touched endpoints

---

## Sprint 4 — Bundle, Build & Asset Polish

**Goal:** Tighten the shipped surface area.

### Workstreams
1. **`next.config.ts`**
   - Add `experimental: { optimizePackageImports: ["lucide-react"] }`.
   - Add a `headers()` rule for `/uploads/(.*)`: `Cache-Control: public, max-age=31536000, immutable`.

2. **Delete dead code**
   - Remove `lib/activity-service.ts` and `lib/mock-activities.ts` (984 lines, no callers).
   - `grep`-verify, then drop the corresponding `import type Activity` consumers.

3. **Client micro-optimizations**
   - `components/filter-controls.tsx:56-62`: `useMemo` the five option `Map`s.
   - `components/account-panel.tsx:81-87`: debounce preference toggles (300 ms) or buffer until explicit save.
   - `components/activity-detail-view.tsx:32-36` + `zuidlaren-agenda-shell.tsx:95-99`: switch analytics POSTs to `navigator.sendBeacon`.

4. **Dockerfile + tsconfig**
   - `Dockerfile`: introduce `npm ci --omit=dev` for a runtime stage; keep full install in builder only. Pin a digest on `node:24-alpine`.
   - `tsconfig.json`: bump `target: "ES2022"`; ensure `tsconfig.tsbuildinfo` is in `.gitignore`.

5. **`/api/analytics/events` payload trim**
   - `app/api/analytics/events/route.ts:24-30`: replace `include` with `select` of only `{ id, status, category: { select: { slug } }, location: { select: { slug } } }`.

### Acceptance
- Bundle analyzer: `lucide-react` chunks contain only used icons.
- Docker image size reduced ≥ 10% vs. previous build.
- No regressions in Playwright suite.

### Expected Improvement
- Client bundle (cumulative across routes): **−10 to −15%**
- Docker image: **−10 to −20%**
- Analytics endpoint query payload: **~80% smaller**

---

## Sprint 5 — Streaming, Observability & Guardrails

**Goal:** Make wins visible and prevent regressions.

### Workstreams
1. **Suspense streaming on the homepage**
   - Split `app/page.tsx` into `<Suspense fallback={<FilterControlsSkeleton />}>` for filter options and a separate boundary for the feed. With Sprint 1 caching this lets the cached part flush instantly.

2. **Prisma query logging gate**
   - Extend `lib/prisma.ts` to attach a `$on("query")` handler in non-prod that warns on queries > 100 ms or N+1 patterns (count repeated identical queries per request).

3. **Web Vitals reporting**
   - Add `reportWebVitals` -> `recordAnalyticsMetric` (new metric `web_vital`) for LCP/CLS/INP. Already aligned with the existing analytics schema (`AnalyticsDailyMetric`).

4. **CI perf budget**
   - Lighthouse CI job on PRs targeting `/`, `/account`, `/business/[slug]`: fail the build if Performance score drops > 5 points or LCP regresses > 300 ms.
   - Bundle-size budget via `@next/bundle-analyzer` thresholds in CI.

5. **Documentation**
   - Update `implementation-plan/16-analytics-and-observability.md` and `19-deployment-tailscale-linux.md` with the new caching and Vitals story.

### Acceptance
- Lighthouse CI green on `/`, `/account`, `/business/[slug]`.
- Slow-query warnings visible in dev logs.
- Web Vitals visible in admin analytics card.

### Expected Improvement
- Sustained — prevents the regressions this plan just fixed.

---

## Expected Improvement Summary

| Topic | Baseline | Target | Δ |
|---|---|---|---|
| Homepage TTFB (warm cache) | 600–900 ms | 80–150 ms | **−80 to −85%** |
| Homepage TTFB (cold) | 600–900 ms | 200–300 ms | **−55 to −70%** |
| DB queries / `/` render | 7 + 1 write | 0 / 2 | **−70 to −100%** |
| Homepage client JS (gzip) | ~250–300 KB | ~100–120 KB | **−55 to −60%** |
| Card image bytes (mobile) | ~120 KB × N | ~15 KB × N | **−85 to −90%** |
| LCP (mobile, 4G) | ~3.5 s | ~1.3–1.6 s | **−55 to −65%** |
| Admin dashboard TTFB | 1.5–2.0 s | 400–600 ms | **−65 to −75%** |
| Admin analytics endpoint | 11 queries | 7 queries | **−35%** |
| Notification send (1k users) | full table → JS filter | indexed SQL | **bounded mem; ~5–10×** |
| Docker image size | baseline | −10 to −20% | **−10 to −20%** |
| Lighthouse Perf (`/`, mobile) | ~55–65 | ≥ 90 | **+30 pts** |

### Total expected impact
- **User-facing latency:** ~5–8× faster homepage in the steady state, ~3× faster admin dashboard, mobile LCP cut by more than half.
- **Infra cost:** DB QPS on the public route falls to near zero in cache-hit mode; Postgres can handle an order-of-magnitude more concurrent users on the same instance.
- **Engineering velocity:** `select` discipline, dead-code removal, and CI perf budgets reduce the surface area for future regressions and make every subsequent feature cheaper.

---

## Sequencing & Dependencies

```
Sprint 1 ──► Sprint 2 ──► Sprint 5
   │              │
   └──► Sprint 3 ─┴──► Sprint 4
```

- Sprint 1 must land first (cache layer is depended on by Sprint 5 streaming).
- Sprints 2 and 3 are independent and can run in parallel with two engineers.
- Sprint 4 is bundle/infra polish — safe to run alongside Sprint 3.
- Sprint 5 closes the loop with observability + guardrails so the wins stick.

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Cache invalidation misses on publish/unpublish leaves stale homepage | Tag-based `revalidateTag` invoked from every write path; integration test covers publish → cache miss |
| `next/image` + Unsplash hot-linking ratelimit | Already allow-listed in `next.config.ts`; image optimizer caches transforms locally |
| Index additions cause migration downtime | Use `CREATE INDEX CONCURRENTLY` via raw migration on production |
| Route-driven detail view changes share-link semantics | Parallel/intercepting routes preserve the modal UX while giving deep links — net UX gain |
| SQL-side preference filtering changes campaign targeting | Snapshot test of recipient list against the existing JS filter before flip |
