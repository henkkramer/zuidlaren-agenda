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
- Email login is the MVP authentication method for normal users.
- A credentials provider is available for the seeded master admin and local test accounts; it uses JWT sessions because Auth.js credentials do not support database sessions.
- Keep OAuth-compatible user model for later.
- Protect user routes with server-side session checks.
- Seeded credential accounts are opt-in via `SEED_CREDENTIAL_ACCOUNTS=true`; usernames default to `admin`, `henk`, and `eigenaar`, while passwords must be supplied through seed environment variables and are not reset after change.

## Implementation Tasks

- Configure Auth.js.
- Add email provider plumbing; development may log magic links if no provider is configured.
- Add `/admin/login` for the master admin credential login.
- Add password change flow for credential-backed accounts.
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
- `PATCH /api/me/password`
- `GET /api/me/notification-preferences`
- `PATCH /api/me/notification-preferences`

## Tests

- Anonymous user cannot access account APIs.
- Logged-in user can read and update own profile.
- User cannot update another user profile.
- Session survives page refresh.
- Seeded credential accounts can authenticate without SMTP.

## Acceptance Criteria

- A resident can create/login to an account.
- Auth state is available to the public agenda for attendance UI.
- No public profile/social behavior exists.

