import type { ScanCandidateInput } from "@/lib/ai-activity-scanner-rules";
import { slugify } from "@/lib/slugify";

export type ExistingActivityForDuplicate = {
  startAt: Date;
  title: string;
};

export type ExistingCandidateForDuplicate = {
  startAt: Date;
  status: string;
  title: string;
};

export type CandidateQualityResult = {
  duplicateReason?: string;
  duplicateScore: number;
  qualityReasons: string[];
  qualityScore: number;
  suggestedStatus: "PENDING" | "DUPLICATE" | "NEEDS_REVIEW";
};

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function tokenSet(value: string) {
  return new Set(slugify(value).split("-").filter((token) => token.length > 2));
}

export function titleSimilarity(left: string, right: string) {
  const a = tokenSet(left);
  const b = tokenSet(right);
  if (a.size === 0 || b.size === 0) return 0;
  const intersection = [...a].filter((token) => b.has(token)).length;
  const union = new Set([...a, ...b]).size;
  return Math.round((intersection / union) * 100);
}

function sameDay(left: Date | string, right: Date | string) {
  return new Date(left).toISOString().slice(0, 10) === new Date(right).toISOString().slice(0, 10);
}

export function scoreCandidateQuality(input: {
  candidate: ScanCandidateInput;
  existingActivities?: ExistingActivityForDuplicate[];
  existingCandidates?: ExistingCandidateForDuplicate[];
}): CandidateQualityResult {
  const reasons: string[] = [];
  let qualityScore = input.candidate.confidence;

  if (input.candidate.aiNotes.length > 0) {
    qualityScore += 5;
    reasons.push("AI-notities aanwezig");
  }

  if (input.candidate.sourceUrl) {
    qualityScore += 8;
    reasons.push("Bronlink aanwezig");
  }

  if (input.candidate.locationName && input.candidate.startAt && input.candidate.endAt) {
    qualityScore += 10;
    reasons.push("Datum, tijd en locatie compleet");
  }

  if (input.candidate.description.length < 80) {
    qualityScore -= 15;
    reasons.push("Beschrijving is kort");
  }

  if (input.candidate.typeTags.length === 0) {
    qualityScore -= 8;
    reasons.push("Tags ontbreken");
  }

  let duplicateScore = 0;
  let duplicateReason: string | undefined;
  const allDuplicates = [
    ...(input.existingActivities ?? []).map((activity) => ({ ...activity, kind: "bestaande activiteit" })),
    ...(input.existingCandidates ?? []).map((candidate) => ({ ...candidate, kind: `scanvoorstel ${candidate.status.toLowerCase()}` })),
  ];

  for (const existing of allDuplicates) {
    if (!sameDay(input.candidate.startAt, existing.startAt)) continue;
    const similarity = titleSimilarity(input.candidate.title, existing.title);
    if (similarity > duplicateScore) {
      duplicateScore = similarity;
      duplicateReason = `${existing.kind}: ${existing.title}`;
    }
  }

  qualityScore = clampScore(qualityScore);
  duplicateScore = clampScore(duplicateScore);

  return {
    duplicateReason: duplicateScore >= 60 ? duplicateReason : undefined,
    duplicateScore,
    qualityReasons: reasons,
    qualityScore,
    suggestedStatus: duplicateScore >= 70 ? "DUPLICATE" : qualityScore < 55 ? "NEEDS_REVIEW" : "PENDING",
  };
}
