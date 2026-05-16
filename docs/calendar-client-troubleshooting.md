# Calendar Client Troubleshooting

Use this when a user can open the agenda in the browser but a calendar client does not show the expected events.

## Quick Checks

- Confirm the client uses `GET` and the exact export URL.
- For public subscriptions, use `/api/public/calendar` and keep any filter query parameters in the saved subscription URL.
- For a single event, use `/api/public/activities/{activityId}/calendar`.
- For personal agenda exports, confirm the browser session is still signed in. The `/api/me/agenda/calendar` route is private and depends on the active session cookie.
- Check whether the client is reusing `If-None-Match`; a matching `ETag` returns `304 Not Modified` with no body.
- If the client receives `429`, reduce refresh frequency and respect `Retry-After`.

## Common Symptoms

| Symptom | Likely Cause | Action |
| --- | --- | --- |
| Public feed is empty | No matching published activities or filters are too narrow | Open the same filtered agenda in the browser and remove filters. |
| Single event returns JSON instead of ICS | Activity is missing or unpublished | Check the activity slug and publication status in admin. |
| Personal feed returns `401` | Session cookie is missing or expired | Sign in again and retry from the same browser profile. |
| Client keeps downloading the same feed | Client ignores `ETag` and `If-None-Match` | Lower refresh frequency in the client. |
| Client shows a rate-limit error | Calendar client polls too often | Wait for `Retry-After` and increase the refresh interval. |

## Release Check

`npm run release:check` includes `public calendar feed` for `/api/public/calendar?limit=3`. A successful result confirms the deployed app can serve the unauthenticated calendar feed, but it does not validate signed-in personal calendar exports.

Use `docs/calendar-abuse-response.md` when the same client or proxy repeatedly triggers `429` responses.
Use `docs/calendar-support-faq.md` for short support answers to common user questions.
