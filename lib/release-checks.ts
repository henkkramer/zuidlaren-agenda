export type ReleaseCheckEndpoint = {
  accept: "application/json" | "text/calendar";
  label: string;
  path: string;
  required: boolean;
};

export const releaseCheckEndpoints: ReleaseCheckEndpoint[] = [
  { accept: "application/json", label: "process health", path: "/api/health", required: true },
  { accept: "application/json", label: "database readiness", path: "/api/health/ready", required: true },
  { accept: "application/json", label: "release health", path: "/api/health/release", required: true },
  { accept: "application/json", label: "mobile capabilities", path: "/api/mobile/capabilities", required: true },
  { accept: "application/json", label: "public activities", path: "/api/public/activities?limit=3", required: true },
  { accept: "text/calendar", label: "public calendar feed", path: "/api/public/calendar?limit=3", required: true },
];

export function normalizeReleaseBaseUrl(value: string | undefined) {
  const baseUrl = value?.trim();

  if (!baseUrl) {
    throw new Error("RELEASE_BASE_URL is required");
  }

  const url = new URL(baseUrl);
  url.pathname = url.pathname.replace(/\/+$/, "");
  url.search = "";
  url.hash = "";

  return url.toString().replace(/\/$/, "");
}

export function buildReleaseCheckUrls(baseUrl: string) {
  const normalizedBaseUrl = normalizeReleaseBaseUrl(baseUrl);

  return releaseCheckEndpoints.map((endpoint) => ({
    ...endpoint,
    url: `${normalizedBaseUrl}${endpoint.path}`,
  }));
}

export function releaseHealthWarnings(payload: unknown) {
  if (!payload || typeof payload !== "object" || !("checks" in payload)) {
    return [];
  }

  const checks = (payload as { checks?: unknown }).checks;
  if (!checks || typeof checks !== "object") {
    return [];
  }

  return Object.entries(checks)
    .filter(([, value]) => value === "warning")
    .map(([name]) => name);
}
