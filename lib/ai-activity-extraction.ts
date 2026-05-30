import type { ActivityCategory } from "@/lib/activity-types";
import type { ScanCandidateInput } from "@/lib/ai-activity-scanner-rules";

export type PublicSourceSnapshot = {
  contentType: string | null;
  fetchedAt: Date;
  sourceName: string;
  sourceUrl: string;
  textSample: string;
};

export type ActivityExtractionProvider = {
  extractCandidates(snapshot: PublicSourceSnapshot, prompt: string): Promise<ScanCandidateInput[]>;
  name: string;
};

const maxEvidenceLength = 280;
const supportedCategories: ActivityCategory[] = ["cultuur", "muziek", "sport", "markt", "kinderen", "eten_drinken", "natuur"];
const privateEventTerms = ["verjaardag", "birthday", "besloten", "prive", "privé", "alleen genodigden", "familiefeest", "bruiloft"];

const extractionSchema = {
  type: "object",
  additionalProperties: false,
  required: ["candidates"],
  properties: {
    candidates: {
      type: "array",
      maxItems: 12,
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

function isValidDateRange(startAt: string, endAt: string) {
  const start = new Date(startAt);
  const end = new Date(endAt);
  return !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && start < end;
}

export function shouldRejectPrivateOrVagueCandidate(input: Pick<ScanCandidateInput, "description" | "shortDescription" | "title">) {
  const text = `${input.title} ${input.shortDescription} ${input.description}`.toLowerCase();
  return privateEventTerms.some((term) => text.includes(term));
}

export function validateExtractedCandidate(value: unknown, snapshot: PublicSourceSnapshot, providerName = "local-structured-extraction"): ScanCandidateInput | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const title = asString(raw.title, 90);
  const shortDescription = asString(raw.shortDescription, 180);
  const description = asString(raw.description, 2200);
  const startAt = asString(raw.startAt, 80);
  const endAt = asString(raw.endAt, 80);
  const locationName = asString(raw.locationName, 120);

  if (!title || !shortDescription || !description || !startAt || !endAt || !locationName || !isValidDateRange(startAt, endAt)) {
    return null;
  }

  const candidate: ScanCandidateInput = {
    title,
    shortDescription,
    description,
    address: asString(raw.address, 160) || undefined,
    aiNotes: asStringArray(raw.aiNotes).length ? asStringArray(raw.aiNotes) : ["Gestructureerd uit publieke brontekst"],
    category: asCategory(raw.category),
    confidence: asConfidence(raw.confidence),
    endAt,
    expectedVisitors: asString(raw.expectedVisitors, 120) || undefined,
    imageUrl: asString(raw.imageUrl, 400) || undefined,
    indoorOutdoor: asString(raw.indoorOutdoor, 40) || undefined,
    locationName,
    organizerName: asString(raw.organizerName, 120) || snapshot.sourceName,
    rawEvidence: {
      evidenceSnippets: evidenceSnippets(snapshot.textSample, title),
      provider: providerName,
      sourceContentType: snapshot.contentType ?? "unknown",
    },
    sourceUrl: asString(raw.sourceUrl, 400) || snapshot.sourceUrl,
    startAt,
    typeTags: asStringArray(raw.typeTags),
  };

  return shouldRejectPrivateOrVagueCandidate(candidate) ? null : candidate;
}

function evidenceSnippets(text: string, title: string) {
  const normalized = text.replace(/\s+/g, " ").trim();
  const lower = normalized.toLowerCase();
  const index = lower.indexOf(title.toLowerCase());
  const start = index >= 0 ? Math.max(0, index - 90) : 0;
  return [normalized.slice(start, start + maxEvidenceLength)].filter(Boolean);
}

function extractStructuredJsonBlocks(text: string) {
  const blocks: unknown[] = [];
  const scriptPattern = /<script[^>]+type=["']application\/zuidlaren-activity\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;

  while ((match = scriptPattern.exec(text))) {
    try {
      const parsed = JSON.parse(match[1] ?? "null") as unknown;
      blocks.push(...(Array.isArray(parsed) ? parsed : [parsed]));
    } catch {
      // Ignore malformed candidate blocks; scan run metadata still records the fetch.
    }
  }

  return blocks;
}

function parseCandidateEnvelope(value: unknown) {
  if (!value || typeof value !== "object") return [];
  const raw = value as { candidates?: unknown };
  return Array.isArray(raw.candidates) ? raw.candidates : [];
}

function parseJsonObject(text: string) {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    return match ? (JSON.parse(match[0]) as unknown) : null;
  }
}

function sourceUserContent(snapshot: PublicSourceSnapshot) {
  return JSON.stringify({
    contentType: snapshot.contentType,
    fetchedAt: snapshot.fetchedAt.toISOString(),
    sourceName: snapshot.sourceName,
    sourceUrl: snapshot.sourceUrl,
    textSample: snapshot.textSample.slice(0, 44_000),
  });
}

function normalizeProviderName(value: string | undefined) {
  return (value ?? "local").trim().toLowerCase();
}

function parseOpenAiOutput(body: unknown) {
  const raw = body as { output_text?: unknown; output?: Array<{ content?: Array<{ text?: unknown; type?: unknown }> }> };
  if (typeof raw.output_text === "string") return raw.output_text;
  for (const output of raw.output ?? []) {
    for (const content of output.content ?? []) {
      if (typeof content.text === "string") return content.text;
    }
  }
  return "";
}

function parseAnthropicToolInput(body: unknown) {
  const raw = body as { content?: Array<{ input?: unknown; text?: unknown; type?: unknown }> };
  const tool = raw.content?.find((item) => item.type === "tool_use" && item.input);
  if (tool?.input) return tool.input;
  const text = raw.content?.find((item) => item.type === "text" && typeof item.text === "string")?.text;
  return typeof text === "string" ? parseJsonObject(text) : null;
}

export const localStructuredActivityExtractionProvider: ActivityExtractionProvider = {
  name: "local-structured-extraction",
  async extractCandidates(snapshot) {
    return extractStructuredJsonBlocks(snapshot.textSample)
      .map((block) => validateExtractedCandidate(block, snapshot, this.name))
      .filter((candidate): candidate is ScanCandidateInput => Boolean(candidate));
  },
};

export const openAiActivityExtractionProvider: ActivityExtractionProvider = {
  name: "openai",
  async extractCandidates(snapshot, prompt) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY ontbreekt");

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        input: [
          { role: "system", content: prompt },
          { role: "user", content: `Extract public Zuidlaren activities from this source JSON. Return JSON only.\n${sourceUserContent(snapshot)}` },
        ],
        max_output_tokens: Number(process.env.AI_ACTIVITY_MAX_OUTPUT_TOKENS ?? 3500),
        model: process.env.OPENAI_ACTIVITY_MODEL ?? "gpt-4o-mini",
        text: {
          format: {
            type: "json_schema",
            name: "zuidlaren_activity_candidates",
            strict: true,
            schema: extractionSchema,
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI extractie mislukt: HTTP ${response.status}`);
    }

    const parsed = parseJsonObject(parseOpenAiOutput(await response.json()));
    return parseCandidateEnvelope(parsed)
      .map((candidate) => validateExtractedCandidate(candidate, snapshot, this.name))
      .filter((candidate): candidate is ScanCandidateInput => Boolean(candidate));
  },
};

export const anthropicActivityExtractionProvider: ActivityExtractionProvider = {
  name: "anthropic",
  async extractCandidates(snapshot, prompt) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY ontbreekt");

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "anthropic-version": process.env.ANTHROPIC_VERSION ?? "2023-06-01",
        "content-type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        max_tokens: Number(process.env.AI_ACTIVITY_MAX_OUTPUT_TOKENS ?? 3500),
        messages: [{ role: "user", content: `Extract public Zuidlaren activities from this source JSON.\n${sourceUserContent(snapshot)}` }],
        model: process.env.ANTHROPIC_ACTIVITY_MODEL ?? "claude-3-5-haiku-latest",
        system: prompt,
        tool_choice: { type: "tool", name: "extract_activities" },
        tools: [
          {
            name: "extract_activities",
            description: "Return public activity candidates found in the source text.",
            input_schema: extractionSchema,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic extractie mislukt: HTTP ${response.status}`);
    }

    return parseCandidateEnvelope(parseAnthropicToolInput(await response.json()))
      .map((candidate) => validateExtractedCandidate(candidate, snapshot, this.name))
      .filter((candidate): candidate is ScanCandidateInput => Boolean(candidate));
  },
};

export function getActivityExtractionProvider(): ActivityExtractionProvider {
  const provider = normalizeProviderName(process.env.AI_ACTIVITY_PROVIDER);
  if (provider === "openai") return openAiActivityExtractionProvider;
  if (provider === "anthropic" || provider === "claude") return anthropicActivityExtractionProvider;
  return localStructuredActivityExtractionProvider;
}
