# Calendar Export Runbook Drill

Run this drill before inviting a new tester group or after changing calendar export behavior.

## Drill Scope

The drill checks the operator path across public exports, personal-export privacy, release validation, and abuse handling. It does not require live payment handling or native mobile apps.

## Steps

1. Run the local release gate:

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
```

2. Run the deployed release check:

```bash
RELEASE_BASE_URL=https://<production-host> npm run release:check
```

3. Confirm the release-check output includes `public calendar feed` with a `text/calendar` content type.
4. Open `/api/public/calendar?limit=3` and confirm the response starts with `BEGIN:VCALENDAR`.
5. Open one published activity detail and use its calendar export link.
6. Sign in, add one activity to `Mijn agenda`, and open `/api/me/agenda/calendar` from the same browser session.
7. Confirm the personal export response uses `private, no-store` and `noindex, nofollow, noarchive`.
8. Send the same public calendar request with `If-None-Match` and confirm a matching `ETag` returns `304 Not Modified`.
9. Review `/admin` analytics and confirm calendar export volume remains aggregate-only.
10. Read `docs/calendar-client-troubleshooting.md` and `docs/calendar-abuse-response.md` before changing rate limits or proxy rules.

## Pass Criteria

- Public, single-activity, and personal calendar exports work through their documented routes.
- The public calendar release check is identifiable by label and content type.
- Personal calendar behavior remains private and session-bound.
- Repeated unchanged polling can use `If-None-Match` and `304 Not Modified`.
- High-frequency polling response steps remain documented before any operational change.
