# 17 - GDPR, Privacy, and Security

## Goal

Build the MVP with EU privacy and security requirements in mind from the beginning.

## Scope

- Data minimization.
- Consent.
- Access control.
- Audit logging.
- Upload and input security.
- Account deletion/export foundations.

## Non-Goals

- Full legal automation in MVP.
- Enterprise compliance dashboard.

## GDPR Defaults

- Private attendance by default.
- Explicit notification opt-in.
- Store only necessary profile fields.
- Allow account deletion/export path.
- Keep processor list for email, hosting, AI, analytics, payments.
- Do not expose private attendance to businesses or public users.

## Security Requirements

- Server-side authorization on every protected API.
- Shared input validation.
- CSRF protection for relevant mutations.
- XSS-safe rendering.
- SQL injection protection through Prisma.
- Rate limits on auth, attendance, reports, AI, and notification endpoints.
- File upload validation.
- Webhook signature verification before payment launch.
- Secrets only through environment variables.
- Audit logs for admin, publish, role, billing, and moderation actions.

## Tests

- Unauthorized access returns 401/403.
- Users cannot access other users' private data.
- Employees cannot access owner/finance routes.
- Upload validation rejects unsafe files.
- Audit logs are created for sensitive actions.

## Acceptance Criteria

- MVP has a defensible privacy posture before real residents or businesses use it.

