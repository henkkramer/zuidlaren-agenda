# Calendar Export Documentation Map

This map keeps the calendar documentation set focused and reduces duplicate guidance.

## Read By Task

| Task | Primary Document | Supporting Documents |
| --- | --- | --- |
| Understand endpoint behavior | `docs/calendar-feeds.md` | `docs/mobile-api-readiness.md`, `docs/public-api-release-notes.md` |
| Validate before tester rollout | `docs/calendar-runbook-drill.md` | `docs/mvp-launch-readiness.md`, `docs/operator-handoff.md` |
| Routine maintenance | `docs/calendar-maintenance-checklist.md` | `docs/public-api-docs-index.md`, `docs/public-api-changelog.md` |
| Diagnose a user report | `docs/calendar-client-troubleshooting.md` | `docs/calendar-support-faq.md` |
| Answer a support question | `docs/calendar-support-faq.md` | `docs/calendar-client-troubleshooting.md` |
| Handle repeated polling | `docs/calendar-abuse-response.md` | `docs/calendar-metrics.md`, `docs/operator-handoff.md` |
| Interpret export volume | `docs/calendar-metrics.md` | `docs/calendar-abuse-response.md` |
| Change public API behavior | `docs/public-api-governance-review.md` | `docs/public-api-changelog.md`, `docs/public-api-release-notes.md` |

## Cleanup Rule

- Endpoint facts live in `docs/calendar-feeds.md`.
- User-facing support phrasing lives in `docs/calendar-support-faq.md`.
- Operator diagnosis steps live in `docs/calendar-client-troubleshooting.md`.
- Routine operational checks live in `docs/calendar-maintenance-checklist.md`.
- Abuse response steps live in `docs/calendar-abuse-response.md`.
- Release-facing public API summaries live in `docs/public-api-release-notes.md`.

When adding a calendar note, update this map only if the task routing changes.
