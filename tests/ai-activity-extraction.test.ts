import assert from "node:assert/strict";
import { test } from "node:test";
import { localStructuredActivityExtractionProvider, shouldRejectPrivateOrVagueCandidate, validateExtractedCandidate } from "@/lib/ai-activity-extraction";

const snapshot = {
  contentType: "text/html",
  fetchedAt: new Date("2026-05-30T10:00:00Z"),
  sourceName: "Testbron",
  sourceUrl: "https://example.nl/agenda",
  textSample: `<html><script type="application/zuidlaren-activity+json">[{"title":"Open podium Zuidlaren","shortDescription":"Publiek muziekpodium in het centrum.","description":"Openbare muziekavond voor bezoekers uit Zuidlaren.","startAt":"2026-09-12T20:00:00+02:00","endAt":"2026-09-12T22:00:00+02:00","locationName":"Centrum Zuidlaren","category":"muziek","typeTags":["Muziek","Binnen"],"organizerName":"Test organisator","confidence":82}]</script></html>`,
};

test("structured extraction provider returns validated candidates from public page text", async () => {
  const candidates = await localStructuredActivityExtractionProvider.extractCandidates(snapshot);

  assert.equal(candidates.length, 1);
  assert.equal(candidates[0].title, "Open podium Zuidlaren");
  assert.equal(candidates[0].category, "muziek");
  assert.deepEqual(candidates[0].rawEvidence.provider, "local-structured-extraction");
});

test("extraction rejects private or vague event candidates", () => {
  assert.equal(shouldRejectPrivateOrVagueCandidate({ title: "Verjaardag Piet", shortDescription: "Besloten", description: "Alleen genodigden" }), true);
  assert.equal(
    validateExtractedCandidate(
      {
        title: "Verjaardag Piet",
        shortDescription: "Besloten verjaardag",
        description: "Alleen genodigden in Zuidlaren.",
        startAt: "2026-09-12T20:00:00+02:00",
        endAt: "2026-09-12T22:00:00+02:00",
        locationName: "Zuidlaren",
      },
      snapshot,
    ),
    null,
  );
});
