import { sessionApiHeaders } from "@/lib/api-response";
import { recordAnalyticsMetric } from "@/lib/analytics";
import { getCurrentSession } from "@/lib/auth";
import { mapActivityRecord } from "@/lib/activity-mapper";
import { calendarRateLimitKey, calendarRateLimitResponse, prepareCalendarResponse } from "@/lib/calendar-export";
import { buildPublicCalendarFeed } from "@/lib/calendar-feed";
import { mobileApiVersion } from "@/lib/mobile-contracts";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

type PersonalAgendaCalendarRow = {
  activity: Parameters<typeof mapActivityRecord>[0];
};

export async function GET(request: Request) {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    return Response.json({ apiVersion: mobileApiVersion, error: "Niet ingelogd" }, { headers: sessionApiHeaders(mobileApiVersion), status: 401 });
  }

  const rateLimit = checkRateLimit({ key: calendarRateLimitKey(request, "personal-agenda", session.user.id), limit: 30, windowMs: 60_000 });
  if (rateLimit.limited) {
    return calendarRateLimitResponse(rateLimit.resetAt, sessionApiHeaders(mobileApiVersion));
  }

  const attendances = await prisma.attendance.findMany({
    where: {
      userId: session.user.id,
      activity: {
        status: "PUBLISHED",
        endAt: { gte: new Date() },
      },
    },
    include: {
      activity: {
        include: {
          category: true,
          location: true,
        },
      },
    },
    orderBy: {
      activity: {
        startAt: "asc",
      },
    },
  });

  const activities = (attendances as PersonalAgendaCalendarRow[]).map((attendance) => mapActivityRecord(attendance.activity));
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
