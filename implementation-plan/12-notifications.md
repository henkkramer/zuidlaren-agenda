# 12 - Notifications

## Goal

Plan and implement notification foundations without creating spam risk.

## Scope

- User notification preferences.
- Email notification infrastructure foundation.
- Campaign and delivery models.
- Admin/business controls for future paid notifications.

## Non-Goals

- Web push in strict MVP.
- Mobile push before native apps.
- WhatsApp integration.
- Open paid notifications before moderation/rate limits exist.

## Staged Delivery

MVP:

- Store notification preferences.
- Allow admin-controlled test email infrastructure.
- Log notification campaign intent.

v1:

- Email campaigns for opted-in users.
- Business notification requests with admin approval.

v2:

- Paid last-minute notifications.
- Web push.

Future:

- Mobile push through APNS/FCM.

## Rules

- Users must opt in.
- Users can choose categories and locations.
- Businesses are rate-limited.
- New businesses may require admin review for notification campaigns.
- Every delivery attempt is logged.

## API Changes

- `GET/PATCH /api/me/notification-preferences`
- `POST /api/businesses/:businessId/notification-campaigns`
- `GET /api/admin/notification-campaigns`
- `POST /api/admin/notification-campaigns/:id/approve`

## Tests

- Opted-out users are excluded.
- Category/location preferences are respected.
- Rate limit prevents repeated campaigns.
- Delivery logs are written.

## Acceptance Criteria

- Notification foundations exist without enabling uncontrolled business spam.

