import { publicApiHeaders } from "@/lib/api-response";
import { recordAnalyticsMetric } from "@/lib/analytics";
import { calendarAttachmentHeader, calendarRateLimitKey } from "@/lib/calendar-export";
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

  await recordAnalyticsMetric({
    metric: "calendar_export",
    activityId: activity.id,
    category: activity.category,
    location: activity.locationName,
    dimensions: {
      kind: "single_activity",
    },
  });

  return new Response(buildPublicCalendarFeed([activity]), {
    headers: {
      ...publicApiHeaders(mobileApiVersion),
      "Content-Disposition": calendarAttachmentHeader(activity.id),
      "Content-Type": "text/calendar; charset=utf-8",
    },
  });
}
