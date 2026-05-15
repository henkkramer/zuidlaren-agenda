# Audit Log Coverage

Sensitive MVP operations must write audit logs so the platform owner can review moderation, role, publishing, notification, and bootstrap changes.

The canonical action list lives in `lib/audit-actions.ts`.

Covered actions:

| Action | Purpose |
| --- | --- |
| `operator.admin.ensure` | First admin creation or promotion. |
| `business.member.upsert` | Business owner adds or reactivates a member. |
| `business.member.update` | Business owner changes member role or permissions. |
| `business.member.deactivate` | Business owner removes member access. |
| `business.activity.create` | Business user creates a draft activity. |
| `business.activity.update` | Business user edits an activity. |
| `business.activity.publish` | Business user publishes an activity. |
| `business.activity.unpublish` | Business user unpublishes an activity. |
| `notification_campaign.request` | Business user requests a notification campaign. |
| `notification_campaign.approve` | Admin approves a notification campaign. |
| `admin.business.status.update` | Admin approves, suspends, or resets a business. |
| `admin.activity.status.update` | Admin moderates an activity status. |
| `admin.user.update` | Admin disables users or changes admin rights. |
| `admin.report.update` | Admin reviews or dismisses a report. |
| `admin.category.create` | Admin creates an activity category. |
| `admin.category.update` | Admin updates an activity category. |
| `admin.feature_flag.update` | Admin changes feature availability. |

`npm run test` verifies that every canonical action still appears in its expected source file.

Notes:

- Payment and billing operations are still MVP foundation screens only. The Mollie webhook foundation verifies signatures and logs webhook events, but live payment status mutations need audit coverage before production payment handling is enabled.
- AI activity assistance usage is recorded in `AiUsageLog`; it is not part of the operator audit log because it does not directly publish, moderate, or change access.
