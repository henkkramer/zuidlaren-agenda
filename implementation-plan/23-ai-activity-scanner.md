# 23 - AI Activity Scanner

## Goal

Give platform admins a weekly, review-first workflow to discover public Zuidlaren activities from approved open sources, reject non-events/noise, and publish approved findings as normal activity cards.

## Safety Principles

- Review-first: AI never publishes directly to the public feed.
- Public sources only: no private groups, no personal profiles, no birthdays/private parties, and no bypassing paywalls or access controls.
- Provenance-first: every candidate stores source URL, evidence notes, scan run, and source metadata.
- Duplicate-aware: rejected and approved candidates keep a canonical key so repeated scans do not recreate the same item.
- Reversible moderation: rejected candidates stay visible and can later be approved.

## Data Model

- `ActivityScanSource`: approved source registry with kind, URL, enabled flag, and robots-respect intent.
- `ActivityScanRun`: one admin-triggered scan for one source.
- `ActivityScanCandidate`: review item with normalized default card fields, source evidence, confidence, and review status.
- Approved candidates create a normal `Activity` and link back through `approvedActivityId`.

## Provider Design

The scanner is provider-based:

- Sprint 1 uses `local-open-source-fixtures`, a deterministic provider that exercises the full admin workflow without crawling third-party sites.
- Sprint 2 adds fetch adapters for approved website/RSS/ICS endpoints with rate limits and source allowlisting.
- Sprint 3 adds AI extraction over fetched public page text, with strict JSON schema, source citations, and private-event filters.
- Sprint 4 adds duplicate clustering and source quality scoring across scan runs.
- Sprint 5 adds scheduling, monitoring, and source management UI.

## Sprint Queue

### Sprint 1 - Review Pipeline Foundation

Status: done on `AI-scraper`.

- Add scan source/run/candidate schema.
- Add local deterministic scanner provider.
- Add admin panel to run scans and review pending/rejected candidates.
- Add approve/reject endpoints.
- Add audit coverage and smoke guardrails.

### Sprint 2 - Source Registry and Fetching

Status: done on `AI-scraper`.

- Add admin CRUD for approved scan sources.
- Fetch public website/RSS/ICS content with timeouts, size caps, and allowlist enforcement.
- Store fetch metadata and extraction errors per run.

### Sprint 3 - AI Extraction

Status: done on `AI-scraper`.

- Add provider abstraction for model-based extraction.
- Extract event candidates into strict structured JSON.
- Filter private events, birthdays, vague posts, and duplicate social reposts.
- Store evidence snippets without copying full third-party pages.

### Sprint 4 - Duplicate and Quality Workflow

Status: done on `AI-scraper`.

- Add fuzzy duplicate matching against activities and historic candidates.
- Add confidence reasons and source quality badges.
- Add bulk approve/reject and correction flow.

### Sprint 5 - Weekly Operations

Status: to do.

- Add weekly scan checklist/scheduler.
- Add scan metrics in admin analytics.
- Add stale source warnings and failed-source retry workflow.
