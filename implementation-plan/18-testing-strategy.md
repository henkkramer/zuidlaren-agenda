# 18 - Testing Strategy

## Goal

Define a practical test strategy that keeps the MVP reliable without slowing delivery.

## Scope

- Unit tests.
- Integration tests.
- End-to-end smoke tests.
- Accessibility and responsive checks.

## Non-Goals

- Perfect coverage.
- Heavy load testing in MVP.

## Test Types

Unit:

- Validation schemas.
- Permission helpers.
- Date/filter helpers.
- Service-layer business rules.

Integration:

- Activity feed queries.
- Attendance mutations.
- Business activity publishing.
- Admin moderation.
- AI usage logging.

E2E:

- Browse public agenda.
- Log in.
- Mark "Ik ga".
- View personal agenda.
- Business owner creates/publishes activity.
- Admin approves business and unpublishes activity.

Accessibility:

- Keyboard navigation.
- Button labels.
- Color contrast.
- Mobile text overflow.

## Commands

- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run test:e2e`
- `npm run build`

## Acceptance Criteria

- Each implementation phase states which tests must pass.
- Critical permissions and privacy behavior are covered by automated tests.

