# Mobile API Readiness

This sprint keeps the web MVP compatible with future native iOS and Android clients.

## Stable API Surface

Public mobile-safe endpoints:

- `GET /api/mobile/capabilities`
- `GET /api/public/activities`
- `GET /api/public/activities/{activityId}`
- `GET /api/me`
- `GET /api/me/agenda`
- `PATCH /api/me/notification-preferences`
- `POST /api/activities/{activityId}/attendance`
- `PATCH /api/activities/{activityId}/attendance`
- `DELETE /api/activities/{activityId}/attendance`

Public list/detail responses include an `apiVersion` field. Activity objects use the existing web shape so mobile clients can reuse the same display terminology:

- `id`
- `title`
- `shortDescription`
- `longDescription`
- `imageUrl`
- `startDateTime`
- `endDateTime`
- `locationName`
- `address`
- `category`
- `typeTags`
- `organizerName`
- `sourceUrl`
- `indoorOutdoor`
- `expectedVisitors`
- `sourceQuality`

## Auth Direction

The MVP still uses NextAuth database sessions and email login links. Native apps should not be built until an OAuth/token exchange is added.

Before native launch:

- Add Apple login.
- Add Google login.
- Define a mobile token exchange or first-party session bridge.
- Keep current session-cookie routes working for the web app.

## Push Direction

The MVP stores notification opt-ins, categories, and locations. Native push should be added after the auth direction is complete.

Planned native push path:

- Add APNS and FCM device-token storage per user/device.
- Keep notification opt-in fields as the source of truth.
- Reuse category/location targeting for email and native push.
- Add delivery audit rows for push attempts.

## Reuse Boundaries

Keep reusable behavior in `lib/` services and pure mappers. React components should remain view-only where possible.

Current reusable modules:

- `lib/public-activities.ts`
- `lib/activity-mapper.ts`
- `lib/public-activity-query.ts`
- `lib/mobile-contracts.ts`
- `lib/privacy-export.ts`

Business/admin APIs are not part of the native MVP unless mobile management becomes a product requirement.
