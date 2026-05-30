import assert from "node:assert/strict";
import { test } from "node:test";
import { scoreCandidateQuality, titleSimilarity } from "@/lib/ai-activity-quality";
import type { ScanCandidateInput } from "@/lib/ai-activity-scanner-rules";

const candidate: ScanCandidateInput = {
  aiNotes: ["Openbare bron", "Datum gevonden"],
  category: "muziek",
  confidence: 70,
  description: "Een openbare muziekavond in Zuidlaren met volledige praktische informatie voor bezoekers.",
  endAt: "2026-09-12T22:00:00+02:00",
  locationName: "Centrum Zuidlaren",
  organizerName: "Organisator",
  shortDescription: "Openbare muziekavond.",
  sourceUrl: "https://example.nl/agenda",
  startAt: "2026-09-12T20:00:00+02:00",
  title: "Open podium Zuidlaren",
  typeTags: ["Muziek"],
  rawEvidence: { provider: "test" },
};

test("title similarity scores overlapping event titles", () => {
  assert.equal(titleSimilarity("Open podium Zuidlaren", "Open podium in Zuidlaren"), 100);
  assert.equal(titleSimilarity("Open podium Zuidlaren", "Paardenmarkt centrum"), 0);
});

test("candidate quality flags likely duplicates on the same day", () => {
  const result = scoreCandidateQuality({
    candidate,
    existingActivities: [{ title: "Open podium in Zuidlaren", startAt: new Date("2026-09-12T18:00:00Z") }],
  });

  assert.equal(result.suggestedStatus, "DUPLICATE");
  assert.ok(result.duplicateScore >= 70);
  assert.match(result.duplicateReason ?? "", /Open podium/);
});

test("candidate quality sends weak candidates to manual review", () => {
  const result = scoreCandidateQuality({
    candidate: { ...candidate, aiNotes: [], confidence: 30, description: "Kort", sourceUrl: "", typeTags: [] },
  });

  assert.equal(result.suggestedStatus, "NEEDS_REVIEW");
  assert.ok(result.qualityReasons.includes("Beschrijving is kort"));
});
