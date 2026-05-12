# 16 - Analytics and Observability

## Goal

Track useful operational and business metrics without invasive user tracking.

## Scope

- Internal activity analytics.
- Basic app health.
- Error logging.
- Privacy-friendly product metrics.

## Non-Goals

- Behavioral ad tracking.
- Cross-site tracking.
- Complex data warehouse.

## Metrics

Track:

- Activity views.
- Attendance clicks.
- Filter usage.
- Business activity counts.
- Notification opt-in counts.
- Admin moderation actions.
- AI usage counts and cost estimates.

Do not track:

- Third-party advertising identifiers.
- Personal browsing profiles.
- Unnecessary precise location.

## Technical Decisions

- Start with internal event counters.
- Consider Plausible or Umami later.
- Add structured server logs.
- Add `/api/health` and optional `/api/health/ready`.

## Tests

- Health endpoint works.
- Analytics events do not require cookies unless explicitly consented.
- Sensitive data is not written to logs.

## Acceptance Criteria

- Platform owner can see whether the MVP is used.
- Analytics remain GDPR-conscious.

