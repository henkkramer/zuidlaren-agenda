# 07 - Filtering and Search

## Goal

Implement practical feed filtering and search for residents.

## Scope

- Mobile-first filter controls.
- URL-backed filter state.
- Server-side filtering.
- Active filter chips.

## Non-Goals

- Geolocation radius in MVP.
- Full-text search tuning beyond basic PostgreSQL support.
- Personalized ranking.

## Filters

- Today.
- Tomorrow.
- This weekend.
- This week.
- Custom date range.
- Location.
- Category.
- Activity type.
- Free/paid.
- Family/children.
- Indoor/outdoor.
- Availability when present.
- Organizer when present.

## Search Fields

- Title.
- Short description.
- Full description.
- Organizer.
- Location.
- Tags.

## Technical Decisions

- Filter state lives in URL query parameters.
- Server validates filters and returns paginated results.
- Client displays active filters as removable chips.
- Use basic PostgreSQL text search or `ILIKE` first; upgrade later if needed.

## Tests

- Each filter narrows results correctly.
- Combined filters work.
- Removing chips updates URL and feed.
- Invalid dates are rejected.
- Search handles empty and whitespace-only queries.

## Acceptance Criteria

- Mobile users can filter without losing feed context.
- Filter URLs are shareable.

