# Calendar Export Support FAQ

This FAQ is for support replies when users ask why calendar subscriptions or downloads behave differently from the web agenda.

## Why does my public calendar show fewer events than the website?

The public calendar feed uses the same filters as the public activity list. If the saved subscription URL contains filters, the calendar client keeps those filters. Ask the user to remove filters in the agenda and subscribe again.

## Why does a single event download show an error?

Single-event calendar exports only work for published activities. Missing, unpublished, or expired slugs return the normal versioned JSON error response instead of an `.ics` file.

## Why does my personal agenda calendar stop working?

The personal calendar export depends on the active signed-in browser session. It is not a public secret URL. Ask the user to sign in again and retry from the same browser profile.

## Can I copy my personal agenda URL into a shared calendar service?

No. Personal agenda exports require the user's active session cookie and are marked `private, no-store` plus `noindex, nofollow, noarchive`. Shared calendar services usually cannot send that browser session.

## Why does the calendar client say nothing changed?

Calendar responses include weak `ETag` headers. A client that sends a matching `If-None-Match` receives `304 Not Modified`, which means it can keep its cached copy.

## Why am I seeing a rate-limit message?

Calendar clients sometimes refresh too often. A `429` response includes `Retry-After`; the user should increase the refresh interval and retry after that delay.

## What should support check before escalating?

- Confirm the route: public feed, single activity, or personal agenda.
- Confirm whether filters are present in the saved URL.
- Confirm whether the user is signed in for personal exports.
- Confirm whether the response is `304`, `401`, `404`, or `429`.
- Check `docs/calendar-client-troubleshooting.md` for operator diagnosis steps.
- Check `docs/calendar-abuse-response.md` only when repeated polling or abuse is suspected.
