# Calendar Feeds

Zuidlaren Agenda exposes calendar exports for public discovery and signed-in personal planning. These feeds are intended for calendar clients, native apps, and simple browser downloads.

## Endpoints

| Endpoint | Auth | Cache | Use |
| --- | --- | --- | --- |
| `GET /api/public/calendar` | Public | `public, max-age=60, stale-while-revalidate=300` | Subscribe to the public agenda feed. Supports the same filters as the public activity list. |
| `GET /api/public/activities/{activityId}/calendar` | Public | `public, max-age=60, stale-while-revalidate=300` | Download one published activity as an `.ics` file. |
| `GET /api/me/agenda/calendar` | Session | `private, no-store` | Export the signed-in user's saved future activities. |

All calendar endpoints return `text/calendar; charset=utf-8` and include `X-Zuidlaren-Api-Version`.
Personal calendar responses also include `X-Robots-Tag: noindex, nofollow, noarchive`.
Calendar exports are rate limited per client or signed-in user and return `429` with `Retry-After` when exceeded.
Calendar exports include weak `ETag` headers and return `304 Not Modified` when clients send a matching `If-None-Match`.

## Client Notes

- Treat public feed URLs as shareable. If filters are present, keep them in the subscription URL.
- Treat `/api/me/agenda/calendar` as user-private. It depends on the active web session and should not be copied into shared calendars that cannot send the session cookie.
- Personal agenda exports record only an aggregate `calendar_export` metric. They do not record user ids or the selected activity ids in analytics dimensions.
- Calendar event `UID` values are stable and based on the activity slug.
- Date-times are emitted in UTC with `DTSTART` and `DTEND`.
- Long iCalendar lines are folded so strict calendar clients can parse the response.
- Download filenames are normalized to short ASCII `.ics` filenames.
- Clients should send `If-None-Match` on repeat requests and respect `304 Not Modified`.
- Missing or unpublished single-activity exports return the normal versioned JSON error response.

See `docs/calendar-abuse-response.md` for operational handling of high-frequency calendar polling.
See `docs/calendar-metrics.md` for aggregate export metrics and monitoring semantics.
See `docs/calendar-client-troubleshooting.md` for client-specific subscription and refresh problems.
See `docs/calendar-support-faq.md` for user-facing support answers.
See `docs/calendar-maintenance-checklist.md` for routine calendar export maintenance.
See `docs/calendar-documentation-map.md` to choose the right calendar document for updates.

## Frozen Contract

The calendar export API contract is frozen for current public and personal clients:

- Method remains `GET`.
- Response content type remains `text/calendar; charset=utf-8`.
- Public feed and single-activity exports remain public and short-cacheable.
- Personal agenda exports remain session-only, private, and no-store.
- All calendar exports keep `ETag`, `If-None-Match`, `304 Not Modified`, `429`, and `Retry-After` behavior.

Contract changes must update `calendarEndpointContracts` in `lib/mobile-contracts.ts`, `tests/mobile-contracts.test.ts`, this document, and `docs/mobile-api-readiness.md` in the same sprint.

## Validation

Calendar contracts are covered by:

- `tests/calendar-feed.test.ts`
- `tests/calendar-export-integration.test.ts`
- `tests/api-response.test.ts`
- `tests/mobile-contracts.test.ts`
- `npm run test:e2e`
