# Public API Release Notes Snapshot

This snapshot summarizes the public and mobile-safe API surface included in the controlled MVP release.

## Version

- API version header: `X-Zuidlaren-Api-Version`
- Current API version: `2026-05-14`
- Locale direction: `nl-NL`

## Public Endpoints

| Endpoint | Auth | Response | Notes |
| --- | --- | --- | --- |
| `GET /api/mobile/capabilities` | Public | JSON | Lists version, auth direction, push direction, endpoint contracts, and calendar export contracts. |
| `GET /api/public/activities` | Public | JSON | Published activities with filters, cursor pagination, and short-lived public cache headers. |
| `GET /api/public/activities/{activityId}` | Public | JSON | One published activity by slug. Missing or unpublished activities return the versioned JSON error shape. |
| `GET /api/public/calendar` | Public | iCalendar | Public agenda feed. Supports the same public filters as the activity list. |
| `GET /api/public/activities/{activityId}/calendar` | Public | iCalendar | One published activity as an `.ics` response. |
| `POST /api/reports` | Public | JSON | Public report intake with rate limiting and shared validation. |

## Session Endpoints

| Endpoint | Auth | Response | Notes |
| --- | --- | --- | --- |
| `GET /api/me` | Session | JSON | Current account profile. |
| `GET /api/me/agenda` | Session | JSON | Signed-in user's private agenda. |
| `GET /api/me/agenda/calendar` | Session | iCalendar | Signed-in user's saved future activities with private no-store and noindex headers. |
| `PATCH /api/me/notification-preferences` | Session | JSON | Notification opt-ins and category/location preferences. |
| `POST /api/activities/{activityId}/attendance` | Session | JSON | Create or replace attendance. |
| `PATCH /api/activities/{activityId}/attendance` | Session | JSON | Update attendance status or visibility. |
| `DELETE /api/activities/{activityId}/attendance` | Session | JSON | Remove attendance. |

## Calendar Contract

Calendar exports return `text/calendar; charset=utf-8`, normalized `.ics` filenames, weak `ETag`, and `304 Not Modified` for matching `If-None-Match` requests. Rate-limited calendar exports return `429` with `Retry-After`.

Public calendar exports are short-cacheable. Personal calendar exports are session-only, `private, no-store`, and include `X-Robots-Tag: noindex, nofollow, noarchive`.

## Release Validation

Before release, run:

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
```

After deploy, run:

```bash
RELEASE_BASE_URL=https://<production-host> npm run release:check
```

The release check includes `public activities` and `public calendar feed`. The calendar check reports the response content type so iCalendar failures are visible in release output.
