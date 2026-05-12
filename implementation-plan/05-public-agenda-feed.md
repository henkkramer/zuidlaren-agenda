# 05 - Public Agenda Feed

## Goal

Build the public agenda as the primary product screen.

## Scope

- Public feed page.
- Published activity listing API.
- Pagination/endless scroll foundation.
- SEO-friendly activity access.

## Non-Goals

- Personal agenda.
- Business creation tools.
- Advanced recommendation ranking.

## Technical Decisions

- Public feed path: `/`.
- Activity detail path: `/activiteiten/[slug]`.
- Feed API uses cursor pagination by `startAt` and `id`.
- Default sort: upcoming activities first.
- Expired activities are hidden from default feed but can be handled later for archives.

## Implementation Tasks

- Create homepage agenda feed.
- Create public activity query service.
- Add cursor-paginated `GET /api/activities`.
- Add `GET /api/activities/:idOrSlug`.
- Render empty, loading, error, and end-of-feed states.
- Add basic metadata for activity detail pages.

## API Query Parameters

- `cursor`
- `limit`
- `datePreset`
- `from`
- `to`
- `category`
- `type`
- `location`
- `free`
- `family`
- `indoorOutdoor`
- `q`

## Validation Rules

- Limit max 50.
- Only published activities are returned.
- Invalid filters return a clear 400 error.

## Tests

- Feed only returns published future activities.
- Pagination is stable.
- Anonymous users can browse.
- Filter query params are accepted and validated.

## Acceptance Criteria

- Visiting `/` shows the public agenda immediately.
- Public browsing works without login.
- Feed state can be represented by URL parameters.

