# 13 - Payments and Billing

## Goal

Define payment foundations for future monetization while keeping payments out of strict MVP launch requirements.

## Scope

- Monetization model.
- Mollie recommendation.
- Data model foundations.
- Webhook event logging plan.

## Non-Goals

- Live payments in MVP.
- Full accounting integration.
- Automated invoicing in MVP.

## Recommendation

Prefer Mollie for Dutch local businesses because of iDEAL support, subscriptions, payment links, and local market fit. Stripe remains a reasonable fallback if international subscription tooling becomes more important.

## Monetization Path

1. Free basic event publishing for approved local businesses/organizations.
2. Paid promoted event.
3. Paid last-minute notification credits.
4. Monthly business packages.
5. Premium analytics later.

## Data Foundations

- `PaymentCustomer`
- `PaymentSubscription`
- `PaymentTransaction`
- `InvoiceReference`
- `WebhookEventLog`

## Implementation Tasks

- Add inactive payment models.
- Add admin-visible billing placeholders only when useful.
- Add webhook signature verification design.
- Add payment event log table before any live payment.

## Tests

- Webhook handler rejects invalid signatures once implemented.
- Duplicate webhook events are idempotent.
- Payment status changes are audited.

## Acceptance Criteria

- MVP is not blocked by billing.
- Future Mollie implementation has clear data foundations.

