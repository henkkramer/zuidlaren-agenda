# Calendar Documentation Archive Review

Use this review when calendar documentation grows or when an old sprint note appears to duplicate the active docs.

## Active Sources

Keep these documents active:

- `docs/calendar-feeds.md` for endpoint facts and frozen contract behavior.
- `docs/calendar-documentation-map.md` for task routing.
- `docs/calendar-maintenance-checklist.md` for recurring operational checks.
- `docs/calendar-runbook-drill.md` for pre-tester and post-change validation.
- `docs/calendar-client-troubleshooting.md` for operator diagnosis.
- `docs/calendar-support-faq.md` for support replies.
- `docs/calendar-abuse-response.md` for repeated polling response.
- `docs/calendar-metrics.md` for aggregate analytics meaning.

## Archive Rule

- Do not delete historical sprint entries from `implementation-plan/SPRINT-QUEUE.md`.
- Prefer linking from the active docs instead of copying old sprint text into new docs.
- If an old note conflicts with the active docs, update the active doc and add a changelog entry when the public API or calendar contract changed.
- Keep `scripts/launch-smoke.ts` focused on active docs only.

## Review Checklist

- Endpoint facts appear only in `docs/calendar-feeds.md`.
- Support phrasing appears only in `docs/calendar-support-faq.md`.
- Operational diagnosis appears only in `docs/calendar-client-troubleshooting.md`.
- Maintenance cadence appears only in `docs/calendar-maintenance-checklist.md`.
- Public API release impact appears in `docs/public-api-release-notes.md` and `docs/public-api-changelog.md`.
