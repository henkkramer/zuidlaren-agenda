import assert from "node:assert/strict";
import { test } from "node:test";
import { deriveActivityScannerOperations } from "@/lib/ai-activity-operations-rules";

test("scanner operations marks weekly stale sources and pending review", () => {
  const result = deriveActivityScannerOperations({
    now: new Date("2026-05-30T10:00:00Z"),
    sources: [
      { enabled: true, id: "fresh", lastScannedAt: "2026-05-29T10:00:00Z", name: "Fresh" },
      { enabled: true, id: "stale", lastScannedAt: "2026-05-20T10:00:00Z", name: "Stale" },
      { enabled: false, id: "off", lastScannedAt: null, name: "Off" },
    ],
    latestRuns: [{ error: null, sourceId: "fresh", sourceName: "Fresh", startedAt: "2026-05-29T10:00:00Z", status: "COMPLETED" }],
    runStatusCounts: [{ count: 1, status: "COMPLETED" }],
    candidateStatusCounts: [
      { count: 2, status: "PENDING" },
      { count: 1, status: "NEEDS_REVIEW" },
      { count: 4, status: "APPROVED" },
    ],
  });

  assert.equal(result.dueSourceCount, 1);
  assert.deepEqual(result.staleSources.map((source) => source.name), ["Stale"]);
  assert.equal(result.pendingReviewCount, 3);
  assert.equal(result.nextWeeklyScanAt, "2026-06-05T10:00:00.000Z");
  assert.equal(result.checklist.find((item) => item.label === "Alle actieve bronnen deze week gescand")?.done, false);
});

test("scanner operations exposes failed sources for retry", () => {
  const result = deriveActivityScannerOperations({
    now: new Date("2026-05-30T10:00:00Z"),
    sources: [{ enabled: true, id: "failed", lastScannedAt: "2026-05-30T09:00:00Z", name: "Failed source" }],
    latestRuns: [{ error: "timeout", sourceId: "failed", sourceName: "Failed source", startedAt: "2026-05-30T09:00:00Z", status: "FAILED" }],
    runStatusCounts: [{ count: 1, status: "FAILED" }],
    candidateStatusCounts: [],
  });

  assert.equal(result.failedSourceCount, 1);
  assert.equal(result.failedSources[0].error, "timeout");
  assert.equal(result.checklist.find((item) => item.label === "Geen mislukte bronnen open")?.done, false);
});
