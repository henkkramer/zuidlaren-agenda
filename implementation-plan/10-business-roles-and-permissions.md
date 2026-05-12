# 10 - Business Roles and Permissions

## Goal

Implement business role separation so employees can help with content without seeing owner-level or financial settings.

## Scope

- Owner and employee roles.
- Permission checks.
- Business member management.
- Audit logs for role changes.

## Non-Goals

- Complex enterprise RBAC UI.
- Finance role in MVP.
- Municipality moderator role in MVP.

## Roles

Owner:

- Manage business settings.
- Manage employees.
- Create/edit/publish/delete activities.
- Use AI assistant.
- View analytics.
- Access future billing.

Employee:

- Create and edit activities.
- Use AI assistant.
- Publish only when `canPublishActivities` is true.
- View business drafts and published activities.
- Cannot view billing or owner-only settings.

## Permission Checks

Every business API must check:

- User is authenticated.
- User is active business member.
- Business is approved for publish actions.
- Required permission is present.

## API Changes

- `GET /api/businesses/:businessId/members`
- `POST /api/businesses/:businessId/members`
- `PATCH /api/businesses/:businessId/members/:memberId`
- `DELETE /api/businesses/:businessId/members/:memberId`

## Tests

- Employee cannot access billing/settings routes.
- Employee publish behavior follows permission flag.
- Owner can add/remove employees.
- User from another business cannot access data.
- Role changes create audit log records.

## Acceptance Criteria

- Employees never get finance/owner privileges by default.
- All business-sensitive actions pass through a shared permission helper.

