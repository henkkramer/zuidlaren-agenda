# 08 - User Personal Agenda

## Goal

Create a personal agenda page for logged-in users based on their attendance records.

## Scope

- `/mijn-agenda`.
- User attendance API.
- Same card and filters as public agenda.
- Attendance removal and visibility updates.

## Non-Goals

- Calendar export in MVP.
- Reminders.
- Public user profile.

## Technical Decisions

- Personal agenda is private to the logged-in user.
- Upcoming activities are shown first.
- Past activities can be hidden by default and added later behind a toggle.
- Attendance visibility is private by default.

## API Changes

- `GET /api/me/agenda`
- `POST /api/activities/:activityId/attendance`
- `PATCH /api/activities/:activityId/attendance`
- `DELETE /api/activities/:activityId/attendance`

## Validation Rules

- Attendance status: `going` or `maybe`.
- Visibility: `private` or `public`.
- User can only modify own attendance.
- Activity must be published to allow resident attendance.

## Tests

- Anonymous user is redirected or receives 401.
- User can mark going from public feed.
- User can remove attendance from personal agenda.
- Private attendance does not appear in public counts.
- Public attendance contributes only to public aggregate display if implemented.

## Acceptance Criteria

- A logged-in resident can maintain a personal agenda.
- No social profile or follower behavior is introduced.

