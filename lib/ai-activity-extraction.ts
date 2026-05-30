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
  extractCandidates(snapshot: PublicSourceSnapshot): Promise<ScanCandidateInput[]>;
  name: string;
};

const maxEvidenceLength = 280;
const supportedCategories: ActivityCategory[] = ["cultuur", "muziek", "sport", "markt", "kinderen", "eten_drinken", "natuur"];
const privateEventTerms = ["verjaardag", "birthday", "besloten", "prive", "privé", "alleen genodigden", "familiefeest", "bruiloft"];

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

export function validateExtractedCandidate(value: unknown, snapshot: PublicSourceSnapshot): ScanCandidateInput | null {
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
      provider: "local-structured-extraction",
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

export const localStructuredActivityExtractionProvider: ActivityExtractionProvider = {
  name: "local-structured-extraction",
  async extractCandidates(snapshot) {
    return extractStructuredJsonBlocks(snapshot.textSample)
      .map((block) => validateExtractedCandidate(block, snapshot))
      .filter((candidate): candidate is ScanCandidateInput => Boolean(candidate));
  },
};

export function getActivityExtractionProvider(): ActivityExtractionProvider {
  return localStructuredActivityExtractionProvider;
}
