import assert from "node:assert/strict";
import { test } from "node:test";
import { defaultActivityScanSources, normalizeScanCandidate } from "@/lib/ai-activity-scanner-rules";

test("default scanner sources cover public local source types", () => {
  const kinds = new Set(defaultActivityScanSources.map((source) => source.kind));

  assert.ok(kinds.has("GOVERNMENT"));
  assert.ok(kinds.has("BAR"));
  assert.ok(kinds.has("SOCIAL"));
});

test("scan candidate normalization creates bounded review data", () => {
  const candidate = normalizeScanCandidate(defaultActivityScanSources[0].candidates[0]);

  assert.equal(candidate.categorySlug, "muziek");
  assert.ok(candidate.canonicalKey.includes("zomeravondconcert"));
  assert.equal(candidate.confidence >= 0 && candidate.confidence <= 100, true);
  assert.equal(candidate.startAt < candidate.endAt, true);
  assert.ok(candidate.aiNotes.length > 0);
});
