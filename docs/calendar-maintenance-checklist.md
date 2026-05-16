# Calendar Export Maintenance Checklist

Use this checklist during routine maintenance, before changing calendar behavior, or after a reported calendar-client incident.

## Monthly Check

- Run `npm run test:e2e` to confirm documentation and route wiring remain covered.
- Run `RELEASE_BASE_URL=https://<production-host> npm run release:check` after deploy and confirm `public calendar feed` reports a `text/calendar` content type.
- Review admin analytics for `agenda exports totaal` and export distribution by kind.
- Check recent support reports against `docs/calendar-support-faq.md`.
- Confirm `docs/public-api-changelog.md` has entries for any public API or calendar changes since the last release.

## Before Calendar Changes

- Read `docs/calendar-feeds.md` for the frozen contract.
- Read `docs/public-api-docs-index.md` to identify all affected docs.
- Update `calendarEndpointContracts` and `tests/mobile-contracts.test.ts` when endpoint contract behavior changes.
- Update `docs/public-api-release-notes.md` and `docs/public-api-changelog.md` in the same branch.
- Run the full validation gate from `docs/calendar-runbook-drill.md`.

## After Incidents

- For repeated `429` responses, follow `docs/calendar-abuse-response.md`.
- For user-facing subscription problems, use `docs/calendar-client-troubleshooting.md`.
- For support replies, use `docs/calendar-support-faq.md`.
- Keep personal calendar exports private, no-store, and session-bound.
- Keep public calendar release checks enabled.
