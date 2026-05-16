# Calendar Export Abuse Response

Calendar export endpoints are intentionally lightweight, but calendar clients can poll aggressively. The app uses in-process rate limiting to reduce accidental or abusive polling.

## Signals

- Repeated `429` responses on `/api/public/calendar`.
- Repeated `429` responses on `/api/public/activities/{activityId}/calendar`.
- Repeated `429` responses on `/api/me/agenda/calendar` for a signed-in user.
- Elevated `calendar_export` analytics counts without matching normal activity views.

## Response

1. Check whether the traffic is from a known calendar client, reverse proxy, or uptime monitor.
2. For public traffic, review the forwarded client IP at the reverse proxy.
3. For personal agenda exports, ask the user to reduce calendar refresh frequency before disabling account access.
4. Keep the public calendar endpoint in release checks; do not remove it to mitigate abuse.
5. If abuse persists, tighten reverse-proxy limits for calendar paths before changing app-level product behavior.

## Client Guidance

- Clients should respect `429` and `Retry-After`.
- Clients should cache by `ETag` and send `If-None-Match` on repeat requests.
- Public calendar feeds may be shared; personal calendar feeds require the user's active session cookie.
