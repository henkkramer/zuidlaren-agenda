# Regression Report - 2026-05-16

Scope: public agenda filtering, real data wiring, runtime health, calendar feed, and release checks on branch `continued-development`.

## Automated Checks

- `npm run typecheck` passed.
- `npm run test` passed with 79 tests.
- `npm run lint` passed.
- `npm run test:e2e` passed.
- `npm run build` passed.

## Live Runtime Checks

Port `3088` was already occupied, so the current branch was tested on `http://127.0.0.1:3089`.

- `/api/health` returned 200.
- `/api/public/activities?limit=96` returned 50 upcoming activities.
- `/api/public/activities?category=sport&limit=96` returned 5 activities.
- `/api/public/activities?type=Buiten&limit=96` returned 29 activities.
- `/api/public/activities?indoorOutdoor=Buiten&limit=96` returned 28 activities.
- `/api/public/activities?q=sport&limit=96` returned 7 activities.
- `/api/public/activities?q=zzzzzz-no-hit&limit=96` returned 0 activities.
- `/?category=sport` rendered filtered real cards.
- `/?q=zzzzzz-no-hit` rendered the empty state and did not show mock cards.

## Release Check

Initial `release:check` reported an `adminUsers` warning because the local database had no admin user. The documented admin bootstrap was run with:

```bash
ADMIN_EMAIL=owner@example.nl ADMIN_DISPLAY_NAME="Zuidlaren Agenda beheerder" npm run admin:ensure
```

After bootstrap, `RELEASE_BASE_URL=http://127.0.0.1:3089 npm run release:check` passed:

- process health
- database readiness
- release health
- mobile capabilities
- public activities
- public calendar feed

## Result

No source regressions remain from this pass. The only runtime issue was local environment data: the release gate requires at least one active admin user.
