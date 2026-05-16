import { publicApiHeaders } from "@/lib/api-response";
import { hasActiveFilterDimensions, recordAnalyticsMetric } from "@/lib/analytics";
import { calendarNotModifiedResponse, calendarRateLimitKey, calendarResponseHeaders } from "@/lib/calendar-export";
import { buildPublicCalendarFeed } from "@/lib/calendar-feed";
import { mobileApiVersion } from "@/lib/mobile-contracts";
import { getPublicActivityFeed } from "@/lib/public-activities";
import { parseActivityFilters } from "@/lib/public-activity-query";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const rateLimit = checkRateLimit({ key: calendarRateLimitKey(request, "public-feed"), limit: 60, windowMs: 60_000 });
  if (rateLimit.limited) {
    const response = rateLimitResponse(rateLimit.resetAt);
    return Response.json(response.body, { ...response.init, headers: { ...response.init.headers, ...publicApiHeaders(mobileApiVersion) } });
  }

  const url = new URL(request.url);
  const filters = parseActivityFilters(Object.fromEntries(url.searchParams.entries()));
  const feed = await getPublicActivityFeed({ ...filters, limit: 96 });
  const body = buildPublicCalendarFeed(feed.activities);
  const headers = calendarResponseHeaders(publicApiHeaders(mobileApiVersion), "zuidlaren-agenda", body);
  const notModifiedResponse = calendarNotModifiedResponse(request, headers);
  if (notModifiedResponse) return notModifiedResponse;

  await recordAnalyticsMetric({
    metric: "calendar_export",
    dimensions: {
      kind: "public_feed",
      filtered: hasActiveFilterDimensions(filters),
    },
  });

  return new Response(body, { headers });
}
