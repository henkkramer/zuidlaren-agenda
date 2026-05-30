import { categoryLabels, type ActivityCategory } from "@/lib/activity-types";
import { parseBusinessActivityPayload } from "@/lib/business-activity-input";
import { slugify } from "@/lib/slugify";

export type ScanCandidateInput = {
  title: string;
  shortDescription: string;
  description: string;
  imageUrl?: string;
  startAt: string;
  endAt: string;
  locationName: string;
  address?: string;
  category: ActivityCategory;
  typeTags: string[];
  indoorOutdoor?: string;
  expectedVisitors?: string;
  sourceUrl: string;
  organizerName: string;
  confidence: number;
  aiNotes: string[];
  rawEvidence: Record<string, string | number | boolean | string[]>;
};

type SourceFixture = {
  slug: string;
  name: string;
  kind: "WEBSITE" | "GOVERNMENT" | "SOCIAL" | "RESTAURANT" | "BAR" | "OTHER";
  baseUrl: string;
  candidates: ScanCandidateInput[];
};

const fallbackImage = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=85";

export const defaultActivityScanSources: SourceFixture[] = [
  {
    slug: "gemeente-tynaarlo-evenementen",
    name: "Gemeente Tynaarlo evenementen",
    kind: "GOVERNMENT",
    baseUrl: "https://www.tynaarlo.nl/",
    candidates: [
      {
        title: "Zomeravondconcert op de Brink",
        shortDescription: "Publiek zomeravondconcert op de Brink in Zuidlaren.",
        description: "Een laagdrempelig buitenconcert op de Brink met lokale muzikanten. De scan markeert dit als publiek evenement omdat locatie, tijd en organisator openbaar genoemd zijn.",
        startAt: "2026-07-03T19:30:00+02:00",
        endAt: "2026-07-03T21:30:00+02:00",
        locationName: "Brink Zuidlaren",
        address: "Brink, Zuidlaren",
        category: "muziek",
        typeTags: ["Muziek", "Gratis", "Buiten"],
        indoorOutdoor: "Buiten",
        expectedVisitors: "Lokale bezoekers",
        sourceUrl: "https://www.tynaarlo.nl/",
        organizerName: "Gemeente Tynaarlo",
        confidence: 72,
        aiNotes: ["Publieke locatie", "Geen aanwijzing voor privefeest", "Datum en tijd gevonden"],
        rawEvidence: { provider: "local-open-source-fixtures", sourceType: "government" },
      },
    ],
  },
  {
    slug: "grand-cafe-zuidlaren-agenda",
    name: "Grand cafe Zuidlaren agenda",
    kind: "BAR",
    baseUrl: "https://example.com/grand-cafe-zuidlaren",
    candidates: [
      {
        title: "Pubquiz avond centrum Zuidlaren",
        shortDescription: "Open pubquizavond voor teams in het centrum.",
        description: "Een openbare pubquizavond waarvoor teams zich kunnen aanmelden. De activiteit is geschikt voor de agenda omdat het om een publiek toegankelijk horeca-evenement gaat.",
        startAt: "2026-07-10T20:00:00+02:00",
        endAt: "2026-07-10T22:30:00+02:00",
        locationName: "Centrum Zuidlaren",
        category: "eten_drinken",
        typeTags: ["Pubquiz", "Horeca", "Binnen"],
        indoorOutdoor: "Binnen",
        expectedVisitors: "Teams en publiek",
        sourceUrl: "https://example.com/grand-cafe-zuidlaren",
        organizerName: "Grand cafe Zuidlaren",
        confidence: 68,
        aiNotes: ["Publiek aanmeldbaar", "Horeca-evenement", "Geen verjaardag of besloten bijeenkomst"],
        rawEvidence: { provider: "local-open-source-fixtures", sourceType: "bar" },
      },
    ],
  },
  {
    slug: "publieke-social-posts-zuidlaren",
    name: "Publieke social posts Zuidlaren",
    kind: "SOCIAL",
    baseUrl: "https://www.facebook.com/search/top?q=zuidlaren%20evenement",
    candidates: [
      {
        title: "Kinderknutselmiddag in de dorpsbibliotheek",
        shortDescription: "Open knutselmiddag voor kinderen en gezinnen.",
        description: "Publieke kinderactiviteit met vrije inloop. De scan sluit priveverjaardagen uit en houdt alleen openbare activiteiten met praktische bezoekersinformatie over.",
        startAt: "2026-08-12T14:00:00+02:00",
        endAt: "2026-08-12T16:00:00+02:00",
        locationName: "Bibliotheek Zuidlaren",
        category: "kinderen",
        typeTags: ["Kinderen", "Gezinnen", "Binnen"],
        indoorOutdoor: "Binnen",
        expectedVisitors: "Gezinnen",
        sourceUrl: "https://www.facebook.com/search/top?q=zuidlaren%20evenement",
        organizerName: "Bibliotheek Zuidlaren",
        confidence: 61,
        aiNotes: ["Openbaar bericht", "Kindvriendelijke activiteit", "Controleer exacte bron voor publicatie"],
        rawEvidence: { provider: "local-open-source-fixtures", sourceType: "social", privateEventFilter: "passed" },
      },
    ],
  },
];

function candidateCanonicalKey(input: Pick<ScanCandidateInput, "title" | "startAt" | "sourceUrl">) {
  const date = new Date(input.startAt).toISOString().slice(0, 10);
  return `${slugify(input.title)}:${date}:${slugify(input.sourceUrl)}`;
}

export function normalizeScanCandidate(input: ScanCandidateInput) {
  const parsed = parseBusinessActivityPayload(
    {
      title: input.title,
      shortDescription: input.shortDescription,
      description: input.description,
      imageUrl: input.imageUrl ?? fallbackImage,
      category: input.category,
      typeTags: input.typeTags,
      locationName: input.locationName,
      address: input.address,
      startAt: input.startAt,
      endAt: input.endAt,
      sourceUrl: input.sourceUrl,
      indoorOutdoor: input.indoorOutdoor,
      expectedVisitors: input.expectedVisitors,
    },
    input.organizerName,
  );

  return {
    ...parsed,
    categorySlug: categoryLabels[parsed.category as ActivityCategory] ? parsed.category : "cultuur",
    canonicalKey: candidateCanonicalKey(input),
    confidence: Math.max(0, Math.min(100, Math.round(input.confidence))),
    aiNotes: input.aiNotes.slice(0, 8),
    rawEvidence: input.rawEvidence,
  };
}

