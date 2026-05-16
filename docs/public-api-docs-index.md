# Public API Documentation Index

Use this index to find the current public and mobile-safe API documentation without searching route code.

## Release and Contract Docs

| Document | Use |
| --- | --- |
| `docs/public-api-release-notes.md` | Current controlled MVP public API snapshot. |
| `docs/public-api-changelog.md` | Chronological record for public API and calendar export changes. |
| `docs/public-api-governance-review.md` | Pre-merge review checklist for public/mobile-safe API changes. |
| `docs/mobile-api-readiness.md` | Future native-client API direction and stable endpoint list. |
| `docs/calendar-feeds.md` | Calendar export endpoint behavior and frozen contract. |

## Calendar Operations Docs

| Document | Use |
| --- | --- |
| `docs/calendar-runbook-drill.md` | Pre-tester and post-change calendar export drill. |
| `docs/calendar-documentation-map.md` | Task-based map for the calendar documentation set. |
| `docs/calendar-documentation-archive-review.md` | Review checklist for keeping active calendar docs distinct from historical sprint notes. |
| `docs/calendar-maintenance-checklist.md` | Routine calendar export maintenance checklist. |
| `docs/calendar-client-troubleshooting.md` | Operator diagnosis for calendar-client issues. |
| `docs/calendar-support-faq.md` | Short support replies for common user questions. |
| `docs/calendar-abuse-response.md` | Response path for high-frequency polling or abuse. |
| `docs/calendar-metrics.md` | Aggregate export metric semantics. |

## Release Flow Docs

| Document | Use |
| --- | --- |
| `docs/pr-release-handoff.md` | Pull request and merge gate rules. |
| `docs/mvp-launch-readiness.md` | Controlled MVP release checklist. |
| `docs/operator-handoff.md` | Production operator runbook. |

## Update Rule

When a public endpoint, API header, auth behavior, cache behavior, response shape, or calendar export contract changes, update the release notes snapshot, changelog, relevant contract docs, and launch-smoke guards in the same sprint.
