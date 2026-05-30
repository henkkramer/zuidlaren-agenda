import assert from "node:assert/strict";
import { test } from "node:test";
import { getActivityDiscoveryProvider, localActivityDiscoveryProvider, openAiWebActivityDiscoveryProvider } from "@/lib/ai-activity-discovery";

test("activity discovery provider defaults to local disabled mode", async () => {
  const previous = process.env.AI_ACTIVITY_DISCOVERY_PROVIDER;
  delete process.env.AI_ACTIVITY_DISCOVERY_PROVIDER;
  delete process.env.AI_ACTIVITY_PROVIDER;

  assert.equal(getActivityDiscoveryProvider().name, "local-discovery-disabled");
  assert.deepEqual(await localActivityDiscoveryProvider.discover("prompt"), []);

  if (previous === undefined) delete process.env.AI_ACTIVITY_DISCOVERY_PROVIDER;
  else process.env.AI_ACTIVITY_DISCOVERY_PROVIDER = previous;
});

test("OpenAI web discovery sends web search request and returns sourced activities", async () => {
  const previousKey = process.env.OPENAI_API_KEY;
  const previousProvider = process.env.AI_ACTIVITY_DISCOVERY_PROVIDER;
  process.env.OPENAI_API_KEY = "test-key";
  process.env.AI_ACTIVITY_DISCOVERY_PROVIDER = "openai";
  const previousFetch = globalThis.fetch;
  let requestBody: { tools?: Array<{ type?: string }>; include?: string[] } = {};

  globalThis.fetch = (async (_url: string | URL | Request, init?: RequestInit) => {
    requestBody = JSON.parse(String(init?.body)) as { tools?: Array<{ type?: string }>; include?: string[] };
    return new Response(
      JSON.stringify({
        output_text: JSON.stringify({
          activities: [{
            title: "Openbare markt Zuidlaren",
            shortDescription: "Publieke markt in het centrum.",
            description: "Een openbare markt in Zuidlaren met kramen en bezoekersinformatie.",
            startAt: "2026-09-01T10:00:00+02:00",
            endAt: "2026-09-01T16:00:00+02:00",
            locationName: "Centrum Zuidlaren",
            organizerName: "Marktorganisatie",
            category: "markt",
            typeTags: ["Markt", "Buiten"],
            sourceUrl: "https://voorbeeld.nl/agenda/openbare-markt",
            confidence: 91,
            aiNotes: ["Bron noemt datum en locatie"],
            discoveredSource: { name: "Voorbeeld agenda", url: "https://voorbeeld.nl/agenda/openbare-markt", kind: "WEBSITE" },
          }],
        }),
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  }) as typeof fetch;

  try {
    assert.equal(getActivityDiscoveryProvider().name, "openai-web-discovery");
    const activities = await openAiWebActivityDiscoveryProvider.discover("Vind publieke activiteiten in Zuidlaren");
    assert.equal(requestBody.tools?.[0]?.type, "web_search");
    assert.ok(requestBody.include?.includes("web_search_call.action.sources"));
    assert.equal(activities.length, 1);
    assert.equal(activities[0].sourceUrl, "https://voorbeeld.nl/agenda/openbare-markt");
    assert.equal(activities[0].discoveredSource?.url, "https://voorbeeld.nl/agenda/openbare-markt");
  } finally {
    globalThis.fetch = previousFetch;
    if (previousKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previousKey;
    if (previousProvider === undefined) delete process.env.AI_ACTIVITY_DISCOVERY_PROVIDER;
    else process.env.AI_ACTIVITY_DISCOVERY_PROVIDER = previousProvider;
  }
});
