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
curl -fsS https://<production-host>/api/health
curl -fsS https://<production-host>/api/health/ready
curl -fsS https://<production-host>/api/health/release
curl -fsS https://<production-host>/api/mobile/capabilities
curl -fsS https://<production-host>/api/public/activities?limit=3
```

`/api/health/release` checks:

- Database connectivity.
- Required runtime environment variables.
- Published activity count.
- Category count.
- Location count.
- Active admin user count.

Warnings for empty content or missing admin users should be resolved before inviting testers.

Admin bootstrap and operator handoff are documented in `docs/operator-handoff.md`.

## Manual Release Gate

- Public agenda opens on desktop and mobile.
- Cards, filters, date sorting, detail view, and load-more behavior work.
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
