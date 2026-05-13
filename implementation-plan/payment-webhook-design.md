# Payment Webhook Design

Sprint 15 keeps live payments disabled for the strict MVP. The payment foundation is prepared for Mollie because it fits Dutch local businesses and supports iDEAL, subscriptions, payment links, and webhooks.

## Current State

- Billing records are internal placeholders.
- `/api/webhooks/mollie` only accepts signed webhook requests.
- Invalid or unsigned webhook calls are rejected and logged in `WebhookEventLog`.
- Duplicate provider event IDs are idempotent and marked as duplicates.
- No payment status changes trigger publishing, promotion, notifications, or billing access yet.

## Launch Requirements Before Live Payments

- Configure `MOLLIE_WEBHOOK_SECRET`.
- Confirm Mollie signature format against live Mollie documentation.
- Add provider API client calls behind a billing service.
- Add reconciliation jobs for transactions and subscriptions.
- Add admin audit logs for every status-changing billing action.
- Add tests for invalid signatures, duplicate event IDs, and provider failure handling.
