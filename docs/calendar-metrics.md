# Calendar Export Metrics

Calendar exports record one aggregate analytics metric: `calendar_export`.

The metric is intended for operational trend monitoring, not personal tracking. Calendar exports never store the signed-in user id, personal agenda contents, or selected personal activity ids in analytics dimensions.

## Dimensions

| Kind | Route | Dimensions | Notes |
| --- | --- | --- | --- |
| `public_feed` | `GET /api/public/calendar` | `kind`, `filtered` | `filtered` is `true` when the public feed URL contains active agenda filters. |
| `single_activity` | `GET /api/public/activities/{activityId}/calendar` | `kind` plus aggregate activity/category/location fields | Used to understand which public activities are exported often. |
| `personal_agenda` | `GET /api/me/agenda/calendar` | `kind` | Personal exports stay aggregate-only. |

Matching `If-None-Match` requests return `304 Not Modified` before metrics are recorded. Repeated unchanged polling should therefore reduce transfer and avoid inflating export counts.

## Operator View

The admin analytics panel shows:

- `agenda exports totaal` for total `calendar_export` volume.
- Export distribution by kind for `public_feed`, `single_activity`, `personal_agenda`, and `unknown`.

Use `docs/calendar-abuse-response.md` when export volume rises together with repeated `429` responses.
