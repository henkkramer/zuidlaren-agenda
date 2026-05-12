import { slugify } from "@/lib/slugify";

export type BusinessActivityPayload = {
  title?: unknown;
  shortDescription?: unknown;
  description?: unknown;
  imageUrl?: unknown;
  category?: unknown;
  typeTags?: unknown;
  locationName?: unknown;
  address?: unknown;
  startAt?: unknown;
  endAt?: unknown;
  sourceUrl?: unknown;
  indoorOutdoor?: unknown;
  expectedVisitors?: unknown;
};

const fallbackImage = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=85";

function requiredString(value: unknown, field: string, maxLength: number) {
  if (typeof value !== "string") {
    throw new Error(`${field} is verplicht`);
  }

  const trimmed = value.trim();

  if (!trimmed) {
    throw new Error(`${field} is verplicht`);
  }

  if (trimmed.length > maxLength) {
    throw new Error(`${field} is te lang`);
  }

  return trimmed;
}

function optionalString(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function parseDate(value: unknown, field: string) {
  const date = new Date(requiredString(value, field, 80));

  if (Number.isNaN(date.getTime())) {
    throw new Error(`${field} is geen geldige datum`);
  }

  return date;
}

export function parseBusinessActivityPayload(payload: BusinessActivityPayload, businessName: string) {
  const title = requiredString(payload.title, "Titel", 90);
  const shortDescription = requiredString(payload.shortDescription, "Korte beschrijving", 180);
  const description = requiredString(payload.description, "Beschrijving", 2200);
  const locationName = requiredString(payload.locationName, "Locatie", 120);
  const startAt = parseDate(payload.startAt, "Startdatum");
  const endAt = parseDate(payload.endAt, "Einddatum");

  if (startAt >= endAt) {
    throw new Error("Startdatum moet voor einddatum liggen");
  }

  const sourceUrl = optionalString(payload.sourceUrl, "https://naarzuidlaren.nl/");

  try {
    new URL(sourceUrl);
  } catch {
    throw new Error("Website moet een geldige URL zijn");
  }

  const category = optionalString(payload.category, "cultuur") || "cultuur";
  const typeTags = Array.isArray(payload.typeTags)
    ? payload.typeTags.filter((tag): tag is string => typeof tag === "string").map((tag) => tag.trim()).filter(Boolean)
    : optionalString(payload.typeTags)
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

  return {
    title,
    shortDescription,
    description,
    imageUrl: optionalString(payload.imageUrl, fallbackImage) || fallbackImage,
    category,
    typeTags,
    locationName,
    address: optionalString(payload.address) || undefined,
    startAt,
    endAt,
    sourceUrl,
    indoorOutdoor: optionalString(payload.indoorOutdoor) || undefined,
    expectedVisitors: optionalString(payload.expectedVisitors) || undefined,
    slug: `${slugify(title)}-${startAt.toISOString().slice(0, 10)}`,
    organizerName: businessName,
  };
}
