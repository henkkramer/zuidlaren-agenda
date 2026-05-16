const fallbackFilename = "zuidlaren-agenda";

export function calendarRateLimitKey(request: Request, scope: "public-feed" | "single-activity" | "personal-agenda", userId?: string) {
  if (userId) {
    return `calendar:${scope}:user:${userId}`;
  }

  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  const client = forwardedFor || realIp || "unknown";

  return `calendar:${scope}:ip:${client.slice(0, 80)}`;
}

export function sanitizeCalendarFilename(input: string) {
  const normalized = input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return normalized || fallbackFilename;
}

export function calendarAttachmentHeader(filename: string) {
  return `inline; filename="${sanitizeCalendarFilename(filename)}.ics"`;
}
