# 15 - Media Storage

## Goal

Support activity banners and business logos safely in local development and future production.

## Scope

- Local file storage for MVP.
- Media metadata table.
- Upload validation.
- S3-compatible abstraction for later.

## Non-Goals

- Advanced image editing.
- CDN optimization in MVP.
- Required AI image generation.

## Technical Decisions

- Store files in a local Docker volume for MVP.
- Store metadata in `MediaAsset`.
- Generate responsive image sizes when practical.
- Abstract storage driver behind a small interface.

## Validation Rules

- Allow JPEG, PNG, WebP.
- Reject oversized files.
- Verify MIME type and extension.
- Enforce max dimensions or resize.
- Associate media with owner business or user.

## API Changes

- `POST /api/media`
- `GET /api/media/:id`
- `DELETE /api/media/:id`

## Tests

- Invalid file type is rejected.
- Oversized upload is rejected.
- Business user cannot delete another business media.
- Activity can reference uploaded banner.

## Acceptance Criteria

- Banners/logos work locally.
- Later migration to S3/R2/B2 does not require schema redesign.

