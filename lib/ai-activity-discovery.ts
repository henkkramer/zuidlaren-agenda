import type { ActivityCategory } from "@/lib/activity-types";
import type { ScanCandidateInput } from "@/lib/ai-activity-scanner-rules";

export type DiscoveredActivitySource = {
  kind?: string;
  name: string;
  url: string;
};

export type DiscoveredActivity = ScanCandidateInput & {
  discoveredSource?: DiscoveredActivitySource;
};

export type ActivityDiscoveryProvider = {
  discover(prompt: string): Promise<DiscoveredActivity[]>;
  name: string;
};

const supportedCategories: ActivityCategory[] = ["cultuur", "muziek", "sport", "markt", "kinderen", "eten_drinken", "natuur"];

const discoverySchema = {
  type: "object",
  additionalProperties: false,
  required: ["activities"],
  properties: {
    activities: {
      type: "array",
      maxItems: 40,
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "title",
          "shortDescription",
          "description",
          "startAt",
          "endAt",
          "locationName",
          "organizerName",
          "category",
          "typeTags",
          "sourceUrl",
          "confidence",
          "aiNotes",
          "discoveredSource",
        ],
        properties: {
          title: { type: "string" },
          shortDescription: { type: "string" },
          description: { type: "string" },
          imageUrl: { type: ["string", "null"] },
          startAt: { type: "string" },
          endAt: { type: "string" },
          locationName: { type: "string" },
          address: { type: ["string", "null"] },
          category: { type: "string", enum: supportedCategories },
          typeTags: { type: "array", items: { type: "string" } },
          indoorOutdoor: { type: ["string", "null"] },
          expectedVisitors: { type: ["string", "null"] },
          sourceUrl: { type: "string" },
          organizerName: { type: "string" },
          confidence: { type: "integer", minimum: 0, maximum: 100 },
          aiNotes: { type: "array", items: { type: "string" } },
          discoveredSource: {
            type: "object",
            additionalProperties: false,
            required: ["name", "url", "kind"],
            properties: {
              name: { type: "string" },
              url: { type: "string" },
              kind: { type: "string" },
            },
          },
        },
      },
    },
  },
};

function asString(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function asStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean).slice(0, 8) : [];
}

function asCategory(value: unknown): ActivityCategory {
  return typeof value === "string" && supportedCategories.includes(value as ActivityCategory) ? (value as ActivityCategory) : "cultuur";
}

function asConfidence(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.min(100, Math.round(value))) : 55;
}

function isPublicHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

function parseJsonObject(text: string) {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    return match ? (JSON.parse(match[0]) as unknown) : null;
  }
}

function parseOpenAiOutput(body: unknown) {
  const raw = body as { output_text?: unknown; output?: Array<{ content?: Array<{ text?: unknown }> }> };
  if (typeof raw.output_text === "string") return raw.output_text;
  for (const output of raw.output ?? []) {
    for (const content of output.content ?? []) {
      if (typeof content.text === "string") return content.text;
    }
  }
  return "";
}

function validateDiscoveredActivity(value: unknown): DiscoveredActivity | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const title = asString(raw.title, 90);
  const shortDescription = asString(raw.shortDescription, 180);
  const description = asString(raw.description, 2200);
  const startAt = asString(raw.startAt, 80);
  const endAt = asString(raw.endAt, 80);
  const locationName = asString(raw.locationName, 120);
  const sourceUrl = asString(raw.sourceUrl, 400);
  const start = new Date(startAt);
  const end = new Date(endAt);

  if (!title || !shortDescription || !description || !locationName || !sourceUrl || !isPublicHttpUrl(sourceUrl)) return null;
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start >= end) return null;

  const sourceRaw = raw.discoveredSource && typeof raw.discoveredSource === "object" ? (raw.discoveredSource as Record<string, unknown>) : {};
  const discoveredUrl = asString(sourceRaw.url, 400) || sourceUrl;

  return {
    title,
    shortDescription,
    description,
    address: asString(raw.address, 160) || undefined,
    aiNotes: asStringArray(raw.aiNotes).length ? asStringArray(raw.aiNotes) : ["Gevonden via internet discovery"],
    category: asCategory(raw.category),
    confidence: asConfidence(raw.confidence),
    discoveredSource: {
      kind: asString(sourceRaw.kind, 40) || "WEBSITE",
      name: asString(sourceRaw.name, 120) || new URL(discoveredUrl).hostname,
      url: discoveredUrl,
    },
    endAt,
    expectedVisitors: asString(raw.expectedVisitors, 120) || undefined,
    imageUrl: asString(raw.imageUrl, 400) || undefined,
    indoorOutdoor: asString(raw.indoorOutdoor, 40) || undefined,
    locationName,
    organizerName: asString(raw.organizerName, 120) || asString(sourceRaw.name, 120) || "Onbekende organisator",
    rawEvidence: { provider: "openai-web-discovery", sourceUrl },
    sourceUrl,
    startAt,
    typeTags: asStringArray(raw.typeTags),
  };
}

function parseDiscoveryEnvelope(value: unknown) {
  if (!value || typeof value !== "object") return [];
  const raw = value as { activities?: unknown };
  return Array.isArray(raw.activities) ? raw.activities : [];
}

export const localActivityDiscoveryProvider: ActivityDiscoveryProvider = {
  name: "local-discovery-disabled",
  async discover() {
    return [];
  },
};

export const openAiWebActivityDiscoveryProvider: ActivityDiscoveryProvider = {
  name: "openai-web-discovery",
  async discover(prompt) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY ontbreekt voor internet discovery");

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        include: ["web_search_call.action.sources"],
        input: `${prompt}\n\nMaak een zo volledig mogelijke lijst van publieke activiteiten in en rond Zuidlaren vanaf vandaag. Zoek breed op internet, maar geef alleen activiteiten met concrete bron-URL. Geef JSON terug volgens het schema.`,
        max_output_tokens: Number(process.env.AI_ACTIVITY_DISCOVERY_MAX_OUTPUT_TOKENS ?? 8000),
        model: process.env.OPENAI_ACTIVITY_DISCOVERY_MODEL ?? process.env.OPENAI_ACTIVITY_MODEL ?? "gpt-5",
        reasoning: { effort: process.env.OPENAI_ACTIVITY_DISCOVERY_REASONING ?? "low" },
        text: {
          format: {
            type: "json_schema",
            name: "zuidlaren_discovered_activities",
            strict: true,
            schema: discoverySchema,
          },
        },
        tools: [{
          type: "web_search",
          user_location: { type: "approximate", country: "NL", city: "Zuidlaren", region: "Drenthe", timezone: "Europe/Amsterdam" },
        }],
        tool_choice: "auto",
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI internet discovery mislukt: HTTP ${response.status}`);
    }

    return parseDiscoveryEnvelope(parseJsonObject(parseOpenAiOutput(await response.json())))
      .map(validateDiscoveredActivity)
      .filter((activity): activity is DiscoveredActivity => Boolean(activity));
  },
};

export function getActivityDiscoveryProvider(): ActivityDiscoveryProvider {
  const provider = (process.env.AI_ACTIVITY_DISCOVERY_PROVIDER ?? process.env.AI_ACTIVITY_PROVIDER ?? "local").toLowerCase();
  return provider === "openai" ? openAiWebActivityDiscoveryProvider : localActivityDiscoveryProvider;
}
