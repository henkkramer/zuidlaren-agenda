# 03 - Database Schema

## Goal

Create the first PostgreSQL/Prisma schema for users, businesses, activities, attendance, admin operations, and future integrations.

## Scope

- Core relational model.
- MVP indexes and constraints.
- Seed data.
- Migration strategy.

## Non-Goals

- Advanced recurring event model.
- Full payment automation.
- Full notification delivery system.
- Scraping ingestion tables.

## Core Models

- `User`: authentication identity.
- `UserProfile`: display name, locale, account flags.
- `Business`: approved local organization/business.
- `BusinessMember`: user-business membership with role and permissions.
- `Role`, `Permission`: flexible RBAC foundations.
- `Activity`: event/activity card.
- `ActivityCategory`: public category.
- `ActivityType`: activity type such as culture, sport, food, family.
- `Location`: normalized place/address.
- `Attendance`: user attendance status and visibility.
- `MediaAsset`: uploaded banners/logos.
- `NotificationPreference`: user opt-in settings.
- `Report`: user/admin problem reports.
- `AuditLog`: sensitive action log.
- `FeatureFlag`: runtime feature toggles.
- `AiPromptTemplate`, `AiUsageLog`: AI foundations.
- `PaymentCustomer`, `PaymentSubscription`, `PaymentTransaction`, `InvoiceReference`: payment foundations.

## Important Fields

`Activity`:

- `id`
- `businessId`
- `title`
- `slug`
- `shortDescription`
- `description`
- `categoryId`
- `typeId`
- `locationId`
- `startAt`
- `endAt`
- `status`: draft, scheduled, published, unpublished, expired
- `visibility`: public, hidden
- `capacity`
- `availabilityStatus`
- `externalUrl`
- `ticketUrl`
- `contactEmail`
- `bannerMediaId`
- `createdByUserId`
- `publishedAt`

`Attendance`:

- `userId`
- `activityId`
- `status`: going, maybe
- `visibility`: private, public
- unique `(userId, activityId)`

`BusinessMember`:

- `businessId`
- `userId`
- `role`: owner, employee
- `canPublishActivities`
- `isActive`

## Indexes

- `Activity(status, startAt)`
- `Activity(categoryId, startAt)`
- `Activity(typeId, startAt)`
- `Activity(locationId, startAt)`
- `Attendance(userId, activityId)` unique
- `BusinessMember(businessId, userId)` unique
- `AuditLog(actorUserId, createdAt)`
- `AuditLog(targetType, targetId)`

## Privacy Considerations

- Do not expose private attendance in public APIs.
- Keep audit logs append-only.
- Store payment provider identifiers, not raw payment details.
- Store AI usage metadata and generated output only as needed.

## Tests

- Migration applies to empty database.
- Seed creates valid categories, locations, sample activities.
- Unique constraints prevent duplicate attendance and duplicate memberships.

## Acceptance Criteria

- Schema supports the strict MVP without requiring destructive redesign.
- Future payments, AI, and notifications have foundations but no MVP dependency.

