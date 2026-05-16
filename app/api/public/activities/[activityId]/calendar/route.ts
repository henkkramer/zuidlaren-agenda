import { publicApiHeaders } from "@/lib/api-response";
import { buildPublicCalendarFeed } from "@/lib/calendar-feed";
import { mobileApiVersion } from "@/lib/mobile-contracts";
import { getPublicActivityDetail } from "@/lib/public-activities";

type PublicActivityCalendarContext = {
  params: Promise<{
    activityId: string;
  }>;
};

export async function GET(_request: Request, context: PublicActivityCalendarContext) {
  const { activityId } = await context.params;
  const activity = await getPublicActivityDetail(activityId);

  if (!activity) {
    return Response.json({ apiVersion: mobileApiVersion, error: "Activiteit niet gevonden" }, { headers: publicApiHeaders(mobileApiVersion), status: 404 });
  }

  return new Response(buildPublicCalendarFeed([activity]), {
    headers: {
      ...publicApiHeaders(mobileApiVersion),
      "Content-Disposition": `inline; filename="${activity.id}.ics"`,
      "Content-Type": "text/calendar; charset=utf-8",
    },
  });
}
