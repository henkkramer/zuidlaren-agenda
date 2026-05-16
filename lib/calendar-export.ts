import { rateLimitResponse } from "@/lib/rate-limit";

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

export function calendarEtag(body: string) {
  let hash = 5381;

  for (let index = 0; index < body.length; index += 1) {
    hash = (hash * 33) ^ body.charCodeAt(index);
  }

  return `W/"${(hash >>> 0).toString(16)}-${body.length}"`;
}

export function calendarResponseHeaders(baseHeaders: Record<string, string>, filename: string, body: string) {
  return {
    ...baseHeaders,
    "Content-Disposition": calendarAttachmentHeader(filename),
    "Content-Type": "text/calendar; charset=utf-8",
    ETag: calendarEtag(body),
  };
}

export function calendarNotModifiedResponse(request: Request, headers: Record<string, string>) {
  const etag = headers.ETag;
  const clientEtags = request.headers
    .get("if-none-match")
    ?.split(",")
    .map((value) => value.trim());

  if (!etag || !clientEtags?.includes(etag)) {
    return null;
  }

  return new Response(null, {
    headers,
    status: 304,
  });
}

export function calendarRateLimitResponse(resetAt: number, headers: Record<string, string>) {
  const response = rateLimitResponse(resetAt);
  return Response.json(response.body, {
    ...response.init,
    headers: {
      ...response.init.headers,
      ...headers,
    },
  });
}

export function prepareCalendarResponse(request: Request, baseHeaders: Record<string, string>, filename: string, body: string) {
  const headers = calendarResponseHeaders(baseHeaders, filename, body);
  const notModifiedResponse = calendarNotModifiedResponse(request, headers);

  return {
    headers,
    notModifiedResponse,
    response: new Response(body, { headers }),
  };
}
