# MVP Launch Readiness

This checklist prepares the controlled Zuidlaren Agenda MVP release. Production traffic is assumed to reach the app through the existing reverse proxy on the production server.

## Automated Checks

Run before release:

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
npm run admin:ensure
```

`npm run test:e2e` is a deterministic launch smoke check. It verifies the critical source routes, documentation, environment template, mobile contracts, and package scripts are present. It does not require a live database.

Pull requests run the same gate in GitHub Actions. See `docs/ci-release-gate.md`.

## Runtime Checks

Run against the deployed app:

```bash
RELEASE_BASE_URL=https://<production-host> npm run release:check
```

The command checks `/api/health`, `/api/health/ready`, `/api/health/release`, `/api/mobile/capabilities`, `/api/public/activities?limit=3`, and `/api/public/calendar?limit=3`. Output labels include `public calendar feed` and the returned content type so calendar release failures are easy to distinguish from JSON API checks.

All routes are served with the shared security header policy from `lib/security-headers.ts`.

`/api/health/release` checks:

- Database connectivity.
- Required runtime environment variables.
- Published activity count.
- Category count.
- Location count.
- Active admin user count.

Warnings for empty content or missing admin users should be resolved before inviting testers.
`npm run release:check` fails when `/api/health/release` returns warnings, so missing published activities, categories, locations, or admin users cannot be ignored during release verification.

Admin bootstrap and operator handoff are documented in `docs/operator-handoff.md`.
Pull request handoff rules are documented in `docs/pr-release-handoff.md`.
Public API release notes are documented in `docs/public-api-release-notes.md`.
Public API documentation is indexed in `docs/public-api-docs-index.md`.
Public API changelog discipline is documented in `docs/public-api-changelog.md`.
Public API governance review is documented in `docs/public-api-governance-review.md`.
Calendar export runbook drills are documented in `docs/calendar-runbook-drill.md`.
Calendar export maintenance is documented in `docs/calendar-maintenance-checklist.md`.
Calendar documentation routing is documented in `docs/calendar-documentation-map.md`.

## Manual Release Gate

- Public agenda opens on desktop and mobile.
- Cards, filters, date sorting, detail view, and load-more behavior work.
- Public and single-activity calendar exports return `.ics` responses.
- Personal agenda calendar export requires a signed-in session and returns private no-store headers.
- Privacy and publication terms are reachable.
- Account login link flow works with the configured email provider.
- "Ik ga" saves as private by default.
- Personal agenda shows selected activities.
- Business owner can create, edit, and publish an activity.
- Admin can approve businesses and unpublish activities.
- Backup and restore commands are documented and have been tested on the target host.

## Production Notes

- Keep `NEXTAUTH_URL` aligned with the public reverse-proxy URL.
- Keep `NEXTAUTH_SECRET` unique and non-placeholder in production.
- Keep database and media backups outside the application container.
- Do not enable live Mollie payments until the payment sprint is promoted from foundation-only to production-ready.
- Native mobile apps remain out of MVP scope; the web API contracts are prepared for later reuse.
