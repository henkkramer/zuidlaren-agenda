import { sessionApiHeaders } from "@/lib/api-response";
import { recordAnalyticsMetric } from "@/lib/analytics";
import { getCurrentSession } from "@/lib/auth";
import { calendarRateLimitKey, calendarRateLimitResponse, prepareCalendarResponse } from "@/lib/calendar-export";
import { buildPublicCalendarFeed } from "@/lib/calendar-feed";
import { mobileApiVersion } from "@/lib/mobile-contracts";
import { getPersonalAgendaActivities } from "@/lib/personal-agenda";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    return Response.json({ apiVersion: mobileApiVersion, error: "Niet ingelogd" }, { headers: sessionApiHeaders(mobileApiVersion), status: 401 });
  }

  const rateLimit = checkRateLimit({ key: calendarRateLimitKey(request, "personal-agenda", session.user.id), limit: 30, windowMs: 60_000 });
  if (rateLimit.limited) {
    return calendarRateLimitResponse(rateLimit.resetAt, sessionApiHeaders(mobileApiVersion));
  }

  const activities = await getPersonalAgendaActivities(session.user.id);
  const body = buildPublicCalendarFeed(activities, new Date(), {
    description: "Mijn opgeslagen activiteiten in Zuidlaren",
    name: "Mijn Zuidlaren Agenda",
  });
  const { notModifiedResponse, response } = prepareCalendarResponse(request, sessionApiHeaders(mobileApiVersion), "mijn-zuidlaren-agenda", body);
  if (notModifiedResponse) return notModifiedResponse;

  await recordAnalyticsMetric({
    metric: "calendar_export",
    dimensions: {
      kind: "personal_agenda",
    },
  });

  return response;
}
