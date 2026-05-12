# 04 - Authentication and Users

## Goal

Implement user accounts with Auth.js email login and basic profile management.

## Scope

- Email login.
- Session handling.
- User profile.
- Account deletion/export foundations.
- Notification preference shell.

## Non-Goals

- Google/Apple OAuth in MVP.
- Passkeys.
- Public profile pages.
- Friend or follower mechanics.

## Technical Decisions

- Use Auth.js with Prisma adapter.
- Email login is the MVP authentication method.
- Keep OAuth-compatible user model for later.
- Protect user routes with server-side session checks.

## Implementation Tasks

- Configure Auth.js.
- Add email provider plumbing; development may log magic links if no provider is configured.
- Add `/account` page.
- Add `/api/me`.
- Add profile update flow for display name and locale.
- Add notification preference defaults.
- Add account deletion request path, even if deletion is initially admin-assisted.

## Validation Rules

- Display name length: 2-80 characters.
- Email must be normalized by auth provider.
- Profile updates require active session.

## API Changes

- `GET /api/me`
- `PATCH /api/me/profile`
- `GET /api/me/notification-preferences`
- `PATCH /api/me/notification-preferences`

## Tests

- Anonymous user cannot access account APIs.
- Logged-in user can read and update own profile.
- User cannot update another user profile.
- Session survives page refresh.

## Acceptance Criteria

- A resident can create/login to an account.
- Auth state is available to the public agenda for attendance UI.
- No public profile/social behavior exists.

