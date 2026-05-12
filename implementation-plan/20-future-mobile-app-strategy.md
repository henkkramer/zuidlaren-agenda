# 20 - Future Mobile App Strategy

## Goal

Keep the webapp architecture compatible with future native iOS and Android apps.

## Scope

- API reuse.
- Authentication direction.
- Push notification path.
- Mobile UX continuity.

## Non-Goals

- Native app implementation in MVP.
- App Store/Play Store work.

## Strategy

- Keep core data access behind route handlers and services.
- Avoid web-only assumptions in domain logic.
- Keep public activity and user agenda APIs stable.
- Use Dutch UI terminology consistently.
- Add Apple/Google login before native app launch.
- Use APNS/FCM for mobile push later.

## API Considerations

Future mobile clients need:

- Activity list/detail.
- Search/filter.
- Auth session/token strategy.
- Attendance mutations.
- Personal agenda.
- Notification preferences.
- Business/admin APIs only if mobile management is desired.

## Tests

- Public APIs return stable JSON shapes.
- Auth strategy can support OAuth later.
- Business logic remains outside React components.

## Acceptance Criteria

- MVP does not need rewriting to expose mobile APIs later.

