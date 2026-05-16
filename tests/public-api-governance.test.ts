import assert from "node:assert/strict";
import { test } from "node:test";
import {
  missingPublicApiGovernanceDocs,
  publicApiGovernanceRequiredChecks,
  publicApiGovernanceRequiredDocs,
} from "@/lib/public-api-governance";

test("public API governance fixture lists required documentation", () => {
  assert.ok(publicApiGovernanceRequiredDocs.includes("docs/public-api-release-notes.md"));
  assert.ok(publicApiGovernanceRequiredDocs.includes("docs/public-api-changelog.md"));
  assert.ok(publicApiGovernanceRequiredDocs.includes("docs/calendar-documentation-map.md"));
});

test("public API governance fixture lists required review checks", () => {
  assert.deepEqual(
    publicApiGovernanceRequiredChecks,
    [
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
    ],
  );
});

test("public API governance fixture reports missing docs", () => {
  assert.deepEqual(missingPublicApiGovernanceDocs(publicApiGovernanceRequiredDocs), []);
  assert.deepEqual(missingPublicApiGovernanceDocs(["docs/public-api-release-notes.md"]), [
    "docs/public-api-changelog.md",
    "docs/public-api-docs-index.md",
    "docs/public-api-governance-review.md",
    "docs/mobile-api-readiness.md",
    "docs/calendar-feeds.md",
    "docs/calendar-documentation-map.md",
  ]);
});
