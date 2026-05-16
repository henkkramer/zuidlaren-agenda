# Public API Changelog

This changelog records public and mobile-safe API changes for the controlled MVP surface. Update it in the same pull request as any public endpoint, response header, cache, auth, version, or calendar export contract change.

## Discipline

- Keep newest entries at the top.
- Include the sprint number, date, changed surface, and operator impact.
- Update `docs/public-api-release-notes.md` when the current release snapshot changes.
- Update `lib/mobile-contracts.ts` and `tests/mobile-contracts.test.ts` when endpoint contracts change.
- Run `npm run test:e2e` so launch smoke confirms release-note and changelog coverage.

## 2026-05-16 - Sprint 73

Changed surface:

- Added this changelog as the required audit trail for public API and calendar export changes.
- Linked changelog discipline from PR handoff and public API release notes.

Operator impact:

- Pull requests that change public/mobile-safe routes now have a documented place to summarize release-facing API behavior.

## 2026-05-16 - Sprint 72

Changed surface:

- Added `docs/public-api-release-notes.md` as the current controlled MVP public API snapshot.

Operator impact:

- Release reviewers can inspect the public and session API surface without reading route code.

## 2026-05-16 - Sprint 68

Changed surface:

- Froze calendar export contracts in `calendarEndpointContracts`.
- Exposed calendar export contracts through `/api/mobile/capabilities`.

Operator impact:

- Calendar contract changes require coordinated code, test, and documentation updates.
