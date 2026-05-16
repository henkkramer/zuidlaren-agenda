export const publicApiGovernanceRequiredDocs = [
  "docs/public-api-release-notes.md",
  "docs/public-api-changelog.md",
  "docs/public-api-docs-index.md",
  "docs/public-api-governance-review.md",
  "docs/mobile-api-readiness.md",
  "docs/calendar-feeds.md",
  "docs/calendar-documentation-map.md",
] as const;

export const publicApiGovernanceRequiredChecks = [
  "release-notes",
  "changelog",
  "docs-index",
  "contract-tests",
  "launch-smoke",
  "sprint-queue",
  "version-header",
  "auth-boundaries",
  "cache-privacy",
  "release-check",
] as const;

export function missingPublicApiGovernanceDocs(availableDocs: Iterable<string>) {
  const available = new Set(availableDocs);
  return publicApiGovernanceRequiredDocs.filter((doc) => !available.has(doc));
}
