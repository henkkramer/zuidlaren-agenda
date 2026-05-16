# Public API Governance Review

Use this review before merging public API, mobile-safe API, or calendar export changes.

## Required Checks

- The changed route is listed in `docs/public-api-release-notes.md` when it is public or mobile-safe.
- `docs/public-api-changelog.md` has a newest-first entry with sprint number, date, changed surface, and operator impact.
- `docs/public-api-docs-index.md` still points to every relevant release, contract, calendar, and handoff document.
- Contract changes update `lib/mobile-contracts.ts`, `tests/mobile-contracts.test.ts`, and the related docs in the same branch.
- Calendar export changes update `docs/calendar-documentation-map.md` and the relevant calendar operations document.
- `scripts/launch-smoke.ts` guards any new required documentation or route contract.

## Merge Questions

- Does the PR body list the completed sprint numbers?
- Does `implementation-plan/SPRINT-QUEUE.md` mark the included sprints as done?
- Does the change preserve `X-Zuidlaren-Api-Version` behavior for public/mobile-safe responses?
- Does the change preserve documented auth boundaries between public and session routes?
- Does the change preserve documented cache and privacy behavior?
- Does the change keep `npm run release:check` useful for production validation?

## Pass Criteria

- Reviewers can understand the public API impact from docs without reading route code.
- Operators can find the follow-up procedure from `docs/public-api-docs-index.md`.
- The validation gate from `docs/pr-release-handoff.md` remains green.
