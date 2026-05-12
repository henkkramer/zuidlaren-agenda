# 09 - Business Backend

## Goal

Build the business dashboard for approved businesses and organizations to manage activity cards.

## Scope

- Business dashboard.
- Activity list.
- Create/edit activity form.
- Draft/published/unpublished states.
- Basic business settings.

## Non-Goals

- Self-serve open business signup in MVP.
- Billing UI.
- Advanced analytics.
- Employee management details; see roles file.

## Technical Decisions

- Business route prefix: `/business`.
- Admin creates or approves businesses.
- Business owners can publish after approval.
- Employees can draft/edit and publish only if permission is enabled.

## Activity Form Fields

- Title.
- Short description.
- Full description.
- Category.
- Type.
- Location/address.
- Start date/time.
- End date/time.
- Banner image.
- Capacity optional.
- Availability optional.
- External URL.
- Ticket/reservation URL optional.
- Organizer contact.
- Tags.
- Status.

## Validation Rules

- Title required and length-limited.
- Short description required and capped for 3-line display.
- Start date must be before end date.
- Location required.
- URLs must be valid.
- Published activities require title, short description, full description, location, start/end, category, and organizer.

## API Changes

- `GET /api/businesses/:businessId/activities`
- `POST /api/businesses/:businessId/activities`
- `PATCH /api/businesses/:businessId/activities/:activityId`
- `POST /api/businesses/:businessId/activities/:activityId/publish`
- `POST /api/businesses/:businessId/activities/:activityId/unpublish`

## Tests

- Approved owner can create and publish.
- Unapproved business cannot publish.
- Employee without publish permission cannot publish.
- Invalid date ranges are rejected.
- Draft can be saved with incomplete optional fields.

## Acceptance Criteria

- Approved businesses can manage their activity cards without admin intervention for every publish.
- Publishing is permission-checked and audited.

