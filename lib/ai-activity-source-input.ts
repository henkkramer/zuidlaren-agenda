import { slugify } from "@/lib/slugify";

const sourceKinds = ["WEBSITE", "GOVERNMENT", "SOCIAL", "RESTAURANT", "BAR", "OTHER"] as const;
type ActivityScanSourceKindInput = (typeof sourceKinds)[number];

export type ActivityScanSourceInput = {
  baseUrl?: unknown;
  enabled?: unknown;
  kind?: unknown;
  name?: unknown;
  respectRobots?: unknown;
  slug?: unknown;
};

export function parseActivityScanSourceInput(input: ActivityScanSourceInput) {
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const baseUrl = typeof input.baseUrl === "string" ? input.baseUrl.trim() : "";
  const kind: ActivityScanSourceKindInput = typeof input.kind === "string" && sourceKinds.includes(input.kind as ActivityScanSourceKindInput) ? (input.kind as ActivityScanSourceKindInput) : "WEBSITE";

  if (!name) {
    throw new Error("Bronnaam is verplicht");
  }

  if (name.length > 120) {
    throw new Error("Bronnaam is te lang");
  }

  let url: URL;
  try {
    url = new URL(baseUrl);
  } catch {
    throw new Error("Bron-URL moet een geldige URL zijn");
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Bron-URL moet http of https gebruiken");
  }

  return {
    baseUrl: url.toString(),
    enabled: typeof input.enabled === "boolean" ? input.enabled : true,
    kind,
    name,
    respectRobots: typeof input.respectRobots === "boolean" ? input.respectRobots : true,
    slug: typeof input.slug === "string" && input.slug.trim() ? slugify(input.slug) : slugify(name),
  };
}
