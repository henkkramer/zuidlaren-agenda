import { publicApiHeaders } from "@/lib/api-response";
import { recordAnalyticsMetric } from "@/lib/analytics";
import { calendarRateLimitKey, calendarRateLimitResponse, prepareCalendarResponse } from "@/lib/calendar-export";
import { buildPublicCalendarFeed } from "@/lib/calendar-feed";
import { mobileApiVersion } from "@/lib/mobile-contracts";
import { getPublicActivityDetail } from "@/lib/public-activities";
import { checkRateLimit } from "@/lib/rate-limit";

type PublicActivityCalendarContext = {
  params: Promise<{
    activityId: string;
  }>;
};

export async function GET(request: Request, context: PublicActivityCalendarContext) {
  const rateLimit = checkRateLimit({ key: calendarRateLimitKey(request, "single-activity"), limit: 90, windowMs: 60_000 });
  if (rateLimit.limited) {
    return calendarRateLimitResponse(rateLimit.resetAt, publicApiHeaders(mobileApiVersion));
  }

  const { activityId } = await context.params;
  const activity = await getPublicActivityDetail(activityId);

  if (!activity) {
    return Response.json({ apiVersion: mobileApiVersion, error: "Activiteit niet gevonden" }, { headers: publicApiHeaders(mobileApiVersion), status: 404 });
  }

  const body = buildPublicCalendarFeed([activity]);
  const { notModifiedResponse, response } = prepareCalendarResponse(request, publicApiHeaders(mobileApiVersion), activity.id, body);
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

  return response;
}
