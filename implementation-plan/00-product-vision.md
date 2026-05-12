# 00 - Product Vision

## Goal

Define the product direction for Zuidlaren Agenda so all implementation work protects the same user experience: a calm, central, mobile-first activity agenda for Zuidlaren.

## Scope

- Public resident experience.
- Business/organization publishing experience.
- Platform admin operating model.
- MVP, v1, v2, and future boundaries.

## Non-Goals

- Social media feed.
- Comments, likes, followers, chat, or direct messaging.
- Ticketing or formal reservations.
- Native mobile apps in MVP.
- Fully automated event scraping in MVP.

## Product Principles

- The public agenda is the first screen.
- Browsing must work without login.
- Login is only needed for personal agenda and attendance.
- "Ik ga" means interest/attendance indication, not a guaranteed reservation.
- Public attendance is opt-in per event.
- Businesses are approved before publishing.
- Paid features must not degrade trust or turn the feed into ads.

## Target Users

| User | Needs |
| --- | --- |
| Resident/visitor | Discover activities, filter quickly, save personal agenda, optional notifications |
| Business owner | Create, publish, and manage activities; manage employees; eventually pay for promotion |
| Business employee | Draft/edit activities and use AI assistance without finance access |
| Platform admin | Keep content, businesses, reports, categories, and settings under control |

## MVP Scope

- Public activity feed.
- Mobile-first activity cards.
- Expand/collapse details.
- Date/category/location/type filters.
- User account.
- Private-by-default "Ik ga".
- Personal agenda.
- Business account with owner and employee role.
- Activity creation and publishing for approved businesses.
- Basic admin for users, businesses, activities, categories, reports, audit logs, feature flags.
- Docker Compose local deployment.

## v1 Scope

- Email notification campaigns with strict opt-in.
- Admin event import workflow.
- Improved media management.
- Business analytics.
- Mollie sandbox groundwork.
- Better moderation workflow.

## v2 Scope

- Paid notifications/promotions.
- Web push.
- Recurring events.
- Calendar export.
- Business subscription packages.
- Public API hardening for mobile apps.

## Future Scope

- Native iOS/Android apps.
- Calendar/scraping ingestion with moderation.
- Accounting integrations.
- Friend-aware attendance only if privacy-preserving and non-social.

## Acceptance Criteria

- Product docs clearly forbid social-network mechanics.
- MVP can be explained in one core loop: browse, save, publish, moderate.
- All later features are explicitly staged outside MVP.

