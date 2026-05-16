import { publicApiHeaders } from "@/lib/api-response";
import { recordAnalyticsMetric } from "@/lib/analytics";
import { calendarNotModifiedResponse, calendarRateLimitKey, calendarResponseHeaders } from "@/lib/calendar-export";
import { buildPublicCalendarFeed } from "@/lib/calendar-feed";
import { mobileApiVersion } from "@/lib/mobile-contracts";
import { getPublicActivityDetail } from "@/lib/public-activities";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

type PublicActivityCalendarContext = {
  params: Promise<{
    activityId: string;
  }>;
};

export async function GET(request: Request, context: PublicActivityCalendarContext) {
  const rateLimit = checkRateLimit({ key: calendarRateLimitKey(request, "single-activity"), limit: 90, windowMs: 60_000 });
  if (rateLimit.limited) {
    const response = rateLimitResponse(rateLimit.resetAt);
    return Response.json(response.body, { ...response.init, headers: { ...response.init.headers, ...publicApiHeaders(mobileApiVersion) } });
  }

  const { activityId } = await context.params;
  const activity = await getPublicActivityDetail(activityId);

  if (!activity) {
    return Response.json({ apiVersion: mobileApiVersion, error: "Activiteit niet gevonden" }, { headers: publicApiHeaders(mobileApiVersion), status: 404 });
  }

  const body = buildPublicCalendarFeed([activity]);
  const headers = calendarResponseHeaders(publicApiHeaders(mobileApiVersion), activity.id, body);
  const notModifiedResponse = calendarNotModifiedResponse(request, headers);
  if (notModifiedResponse) return notModifiedResponse;

  await recordAnalyticsMetric({
    metric: "calendar_export",
    activityId: activity.id,
    category: activity.category,
    location: activity.locationName,
    dimensions: {
      kind: "single_activity",
    },
  });

  return new Response(body, { headers });
}
