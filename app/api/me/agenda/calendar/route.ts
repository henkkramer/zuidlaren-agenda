import { sessionApiHeaders } from "@/lib/api-response";
import { recordAnalyticsMetric } from "@/lib/analytics";
import { getCurrentSession } from "@/lib/auth";
import { mapActivityRecord } from "@/lib/activity-mapper";
import { buildPublicCalendarFeed } from "@/lib/calendar-feed";
import { mobileApiVersion } from "@/lib/mobile-contracts";
import { prisma } from "@/lib/prisma";

type PersonalAgendaCalendarRow = {
  activity: Parameters<typeof mapActivityRecord>[0];
};

export async function GET() {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    return Response.json({ apiVersion: mobileApiVersion, error: "Niet ingelogd" }, { headers: sessionApiHeaders(mobileApiVersion), status: 401 });
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

  await recordAnalyticsMetric({
    metric: "calendar_export",
    dimensions: {
      kind: "personal_agenda",
    },
  });

  return new Response(
    buildPublicCalendarFeed(activities, new Date(), {
      description: "Mijn opgeslagen activiteiten in Zuidlaren",
      name: "Mijn Zuidlaren Agenda",
    }),
    {
      headers: {
        ...sessionApiHeaders(mobileApiVersion),
        "Content-Disposition": 'inline; filename="mijn-zuidlaren-agenda.ics"',
        "Content-Type": "text/calendar; charset=utf-8",
      },
    },
  );
}
