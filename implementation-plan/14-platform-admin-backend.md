# 14 - Platform Admin Backend

## Goal

Build the operational admin backend needed to keep the platform trustworthy.

## Scope

- Users.
- Businesses.
- Activities.
- Categories/types/locations.
- Reports.
- Audit logs.
- Feature flags.

## Non-Goals

- Full finance dashboard in MVP.
- Advanced AI cost dashboard.
- Complex system monitoring UI.

## Technical Decisions

- Admin route prefix: `/admin`.
- Admin access is granted by explicit user role/flag.
- All admin mutations create audit logs.
- Admin UI is utilitarian and table/detail based.

## Admin Capabilities

- Search users.
- Disable users.
- Create/approve/suspend businesses.
- View and edit activities.
- Unpublish activities.
- Manage categories, types, and locations.
- Review reports.
- View audit logs.
- Toggle feature flags.

## API Changes

- `GET /api/admin/users`
- `PATCH /api/admin/users/:id`
- `GET /api/admin/businesses`
- `PATCH /api/admin/businesses/:id`
- `GET /api/admin/activities`
- `PATCH /api/admin/activities/:id`
- `GET/POST/PATCH /api/admin/categories`
- `GET/PATCH /api/admin/reports`
- `GET /api/admin/audit-logs`
- `GET/PATCH /api/admin/feature-flags`

## Tests

- Non-admin users cannot access admin routes.
- Admin actions create audit logs.
- Suspended businesses cannot publish.
- Admin can unpublish problematic activity.

## Acceptance Criteria

- Platform owner can operate MVP without direct database edits for normal tasks.

