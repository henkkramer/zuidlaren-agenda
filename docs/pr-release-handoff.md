# PR Release Handoff

This handoff keeps release work tied to one GitHub pull request instead of parallel plans.

## Current Flow

1. Keep sprint work on `continued-development`.
2. Open or update one pull request from `continued-development` to `main`.
3. Let GitHub Actions run lint, typecheck, tests, launch smoke, and build.
4. Merge only when CI is green and the sprint queue marks the included work as done.
5. After deploy, run `RELEASE_BASE_URL=<production-url> npm run release:check`.

## Merge Gate

- The PR body must list the completed sprint numbers.
- `implementation-plan/SPRINT-QUEUE.md` must be updated in the same branch.
- Runtime release warnings from `/api/health/release` must be fixed before inviting testers.
- Payment, native mobile, scraping, and advanced notification work stay out of release PRs until explicitly promoted.

## Active PR

The active handoff PR is the open GitHub pull request from `continued-development` to `main`. If a previous PR has already been merged, create a new PR for the next sprint batch instead of reopening historical release notes.
