import "server-only";

import type { AiActivityAction, AiActivityInput, AiActivitySuggestion } from "@/lib/ai-card-assistant-types";
import type { ActivityCategory } from "@/lib/activity-types";

export type AiProvider = {
  name: string;
  assistActivity(action: AiActivityAction, input: AiActivityInput): Promise<AiActivitySuggestion>;
};

const maxFieldLength = 1200;
const categoryKeywords: Array<{ category: ActivityCategory; keywords: string[] }> = [
  { category: "muziek", keywords: ["concert", "muziek", "band", "koor", "dj", "zang", "festival"] },
  { category: "sport", keywords: ["sport", "wedstrijd", "loop", "fiet", "training", "toernooi"] },
  { category: "markt", keywords: ["markt", "braderie", "kraam", "verkoop", "fair"] },
  { category: "kinderen", keywords: ["kind", "gezin", "familie", "jeugd", "speurtocht"] },
  { category: "eten_drinken", keywords: ["eten", "drinken", "proeverij", "diner", "lunch", "food"] },
  { category: "natuur", keywords: ["wandeling", "natuur", "bos", "landschap", "excursie"] },
  { category: "cultuur", keywords: ["cultuur", "kunst", "lezing", "theater", "historie", "museum"] },
];

function clean(value?: string) {
  return (value ?? "").replace(/\s+/g, " ").trim().slice(0, maxFieldLength);
}

function sentence(value: string) {
  if (!value) {
    return "";
  }

  const trimmed = value.trim();
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1).trim()}...`;
}

function tagsFromInput(input: AiActivityInput) {
  const text = `${input.title ?? ""} ${input.shortDescription ?? ""} ${input.description ?? ""}`.toLowerCase();
  const existing = clean(input.typeTags)
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  const additions = [
    text.includes("kind") || text.includes("familie") ? "Gezinnen" : "",
    text.includes("gratis") ? "Gratis" : "",
    text.includes("buiten") || text.includes("wandeling") ? "Buiten" : "",
    text.includes("muziek") || text.includes("concert") ? "Muziek" : "",
    text.includes("markt") ? "Markt" : "",
  ].filter(Boolean);

  return Array.from(new Set([...existing, ...additions])).slice(0, 6);
}

function categoryFromInput(input: AiActivityInput): ActivityCategory {
  const text = `${input.title ?? ""} ${input.shortDescription ?? ""} ${input.description ?? ""} ${input.typeTags ?? ""}`.toLowerCase();
  const match = categoryKeywords.find(({ keywords }) => keywords.some((keyword) => text.includes(keyword)));
  return match?.category ?? input.category ?? "cultuur";
}

function baseCopy(input: AiActivityInput) {
  const title = clean(input.title) || "Nieuwe activiteit";
  const shortDescription = clean(input.shortDescription) || clean(input.description) || "Ontdek deze activiteit in Zuidlaren.";
  const description = clean(input.description) || shortDescription;
  return { title, shortDescription, description };
}

export const localAiCardAssistantProvider: AiProvider = {
  name: "local-rules",
  async assistActivity(action, input) {
    const copy = baseCopy(input);
    const location = clean(input.locationName) || "Zuidlaren";

    if (action === "shorten") {
      return {
        fields: {
          shortDescription: truncate(copy.shortDescription, 120),
          description: truncate(copy.description, 420),
        },
        notes: ["Tekst ingekort voor een sneller scanbare activiteitenkaart."],
      };
    }

    if (action === "more_enthusiastic") {
      return {
        fields: {
          shortDescription: truncate(`Kom langs bij ${copy.title} in ${location}. ${copy.shortDescription}`, 180),
          description: `${sentence(copy.description)} Een toegankelijke activiteit om samen te beleven in ${location}.`,
        },
        notes: ["Toon actiever gemaakt zonder de inhoud automatisch te publiceren."],
      };
    }

    if (action === "more_formal") {
      return {
        fields: {
          shortDescription: truncate(`${copy.title} vindt plaats in ${location}. ${copy.shortDescription}`, 180),
          description: `${sentence(copy.description)} Bezoekers vinden praktische informatie en eventuele voorwaarden via de organisator.`,
        },
        notes: ["Formulering zakelijker en rustiger gemaakt."],
      };
    }

    if (action === "family_friendly") {
      return {
        fields: {
          shortDescription: truncate(`${copy.shortDescription} Ook geschikt om met het gezin te bezoeken.`, 180),
          typeTags: Array.from(new Set([...tagsFromInput(input), "Gezinnen", "Kinderen"])).slice(0, 6),
          category: "kinderen",
        },
        notes: ["Gezinsvriendelijke invalshoek toegevoegd. Controleer zelf of dit inhoudelijk klopt."],
      };
    }

    if (action === "suggest_tags") {
      return {
        fields: { typeTags: tagsFromInput(input) },
        notes: ["Tags voorgesteld op basis van titel en beschrijving."],
      };
    }

    if (action === "suggest_category_type") {
      return {
        fields: {
          category: categoryFromInput(input),
          typeTags: tagsFromInput(input),
        },
        notes: ["Categorie en tags voorgesteld op basis van herkenbare trefwoorden."],
      };
    }

    if (action === "banner_prompt") {
      return {
        bannerPrompt: `Een realistische, warme foto voor een activiteit in Zuidlaren: ${copy.title}, locatie ${location}, sfeer passend bij ${copy.shortDescription}. Geen tekst in beeld.`,
        notes: ["Bannerprompt gemaakt voor later gebruik bij beeldselectie of beeldgeneratie."],
      };
    }

    if (action === "missing_information") {
      const notes = [
        clean(input.title) ? "" : "Titel ontbreekt.",
        clean(input.shortDescription) ? "" : "Korte beschrijving ontbreekt.",
        clean(input.description) ? "" : "Uitgebreide beschrijving ontbreekt.",
        clean(input.locationName) ? "" : "Locatie ontbreekt.",
        clean(input.startAt) && clean(input.endAt) ? "" : "Start- of eindtijd ontbreekt.",
        clean(input.sourceUrl) ? "" : "Website of bron ontbreekt.",
      ].filter(Boolean);

      return {
        notes: notes.length ? notes : ["Geen duidelijke ontbrekende basisinformatie gevonden."],
      };
    }

    return {
      fields: {
        title: copy.title,
        shortDescription: truncate(`${copy.shortDescription} Bekijk de details en plan je bezoek aan ${location}.`, 180),
        description: `${sentence(copy.description)} De activiteit is bedoeld voor bezoekers die iets willen beleven in en rond Zuidlaren.`,
      },
      notes: ["Tekst aangescherpt voor duidelijkheid en lokale context."],
    };
  },
};

export function estimateTokens(value: unknown) {
  return Math.ceil(JSON.stringify(value).length / 4);
}
