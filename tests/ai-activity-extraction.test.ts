import assert from "node:assert/strict";
import { test } from "node:test";
import { anthropicActivityExtractionProvider, getActivityExtractionProvider, localStructuredActivityExtractionProvider, openAiActivityExtractionProvider, shouldRejectPrivateOrVagueCandidate, validateExtractedCandidate } from "@/lib/ai-activity-extraction";

const prompt = "Extract public Zuidlaren activities as JSON and exclude private events.";

const snapshot = {
  contentType: "text/html",
  fetchedAt: new Date("2026-05-30T10:00:00Z"),
  sourceName: "Testbron",
  sourceUrl: "https://example.nl/agenda",
  textSample: `<html><script type="application/zuidlaren-activity+json">[{"title":"Open podium Zuidlaren","shortDescription":"Publiek muziekpodium in het centrum.","description":"Openbare muziekavond voor bezoekers uit Zuidlaren.","startAt":"2026-09-12T20:00:00+02:00","endAt":"2026-09-12T22:00:00+02:00","locationName":"Centrum Zuidlaren","category":"muziek","typeTags":["Muziek","Binnen"],"organizerName":"Test organisator","confidence":82}]</script></html>`,
};

test("structured extraction provider returns validated candidates from public page text", async () => {
  const candidates = await localStructuredActivityExtractionProvider.extractCandidates(snapshot, prompt);

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


test("provider selection defaults local and supports OpenAI or Anthropic", () => {
  const previous = process.env.AI_ACTIVITY_PROVIDER;
  delete process.env.AI_ACTIVITY_PROVIDER;
  assert.equal(getActivityExtractionProvider().name, "local-structured-extraction");
  process.env.AI_ACTIVITY_PROVIDER = "openai";
  assert.equal(getActivityExtractionProvider().name, "openai");
  process.env.AI_ACTIVITY_PROVIDER = "claude";
  assert.equal(getActivityExtractionProvider().name, "anthropic");
  if (previous === undefined) {
    delete process.env.AI_ACTIVITY_PROVIDER;
  } else {
    process.env.AI_ACTIVITY_PROVIDER = previous;
  }
});

test("OpenAI extraction provider sends structured-output request", async () => {
  const previousKey = process.env.OPENAI_API_KEY;
  process.env.OPENAI_API_KEY = "test-key";
  const previousFetch = globalThis.fetch;
  let requestBody: { text?: { format?: { type?: string } } } = {};
  globalThis.fetch = (async (_url: string | URL | Request, init?: RequestInit) => {
    requestBody = JSON.parse(String(init?.body)) as { text?: { format?: { type?: string } } };
    return new Response(
      JSON.stringify({
        output_text: JSON.stringify({
          candidates: [{
            title: "Publieke lezing Zuidlaren",
            shortDescription: "Openbare lezing voor bezoekers.",
            description: "Een openbare lezing in Zuidlaren met praktische informatie voor bezoekers.",
            startAt: "2026-10-10T19:00:00+02:00",
            endAt: "2026-10-10T21:00:00+02:00",
            locationName: "Bibliotheek Zuidlaren",
            organizerName: "Bibliotheek",
            category: "cultuur",
            typeTags: ["Lezing"],
            sourceUrl: "https://example.nl/agenda",
            confidence: 88,
            aiNotes: ["Bron noemt openbare lezing"],
          }],
        }),
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  }) as typeof fetch;

  try {
    const candidates = await openAiActivityExtractionProvider.extractCandidates({ ...snapshot, textSample: "Publieke lezing Zuidlaren" }, prompt);
    assert.equal(requestBody.text?.format?.type, "json_schema");
    assert.equal(candidates[0].rawEvidence.provider, "openai");
  } finally {
    globalThis.fetch = previousFetch;
    if (previousKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previousKey;
  }
});

test("Anthropic extraction provider sends tool schema request", async () => {
  const previousKey = process.env.ANTHROPIC_API_KEY;
  process.env.ANTHROPIC_API_KEY = "test-key";
  const previousFetch = globalThis.fetch;
  let requestBody: { tool_choice?: { name?: string } } = {};
  globalThis.fetch = (async (_url: string | URL | Request, init?: RequestInit) => {
    requestBody = JSON.parse(String(init?.body)) as { tool_choice?: { name?: string } };
    return new Response(
      JSON.stringify({
        content: [{
          type: "tool_use",
          input: {
            candidates: [{
              title: "Publieke wandeling Zuidlaren",
              shortDescription: "Openbare wandeling voor bezoekers.",
              description: "Een openbare wandeling in Zuidlaren met praktische informatie voor bezoekers.",
              startAt: "2026-10-11T10:00:00+02:00",
              endAt: "2026-10-11T12:00:00+02:00",
              locationName: "Brink Zuidlaren",
              organizerName: "Wandelgroep",
              category: "natuur",
              typeTags: ["Wandeling"],
              sourceUrl: "https://example.nl/agenda",
              confidence: 84,
              aiNotes: ["Bron noemt openbare wandeling"],
            }],
          },
        }],
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  }) as typeof fetch;

  try {
    const candidates = await anthropicActivityExtractionProvider.extractCandidates({ ...snapshot, textSample: "Publieke wandeling Zuidlaren" }, prompt);
    assert.equal(requestBody.tool_choice?.name, "extract_activities");
    assert.equal(candidates[0].rawEvidence.provider, "anthropic");
  } finally {
    globalThis.fetch = previousFetch;
    if (previousKey === undefined) delete process.env.ANTHROPIC_API_KEY;
    else process.env.ANTHROPIC_API_KEY = previousKey;
  }
});
