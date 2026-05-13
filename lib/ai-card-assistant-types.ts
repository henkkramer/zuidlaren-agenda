import type { ActivityCategory } from "@/lib/activity-types";

export const aiActivityActions = [
  "improve_text",
  "shorten",
  "more_enthusiastic",
  "more_formal",
  "family_friendly",
  "suggest_tags",
  "suggest_category_type",
  "banner_prompt",
  "missing_information",
] as const;

export type AiActivityAction = (typeof aiActivityActions)[number];

export type AiActivityInput = {
  title?: string;
  shortDescription?: string;
  description?: string;
  locationName?: string;
  address?: string;
  category?: ActivityCategory;
  typeTags?: string;
  startAt?: string;
  endAt?: string;
  sourceUrl?: string;
  organizerName?: string;
};

export type AiActivitySuggestion = {
  fields?: {
    title?: string;
    shortDescription?: string;
    description?: string;
    typeTags?: string[];
    category?: ActivityCategory;
  };
  bannerPrompt?: string;
  notes: string[];
};

export function isAiActivityAction(value: unknown): value is AiActivityAction {
  return typeof value === "string" && aiActivityActions.includes(value as AiActivityAction);
}
