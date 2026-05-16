import { publicApiHeaders } from "@/lib/api-response";
import { buildPublicCalendarFeed } from "@/lib/calendar-feed";
import { mobileApiVersion } from "@/lib/mobile-contracts";
import { getPublicActivityFeed } from "@/lib/public-activities";
import { parseActivityFilters } from "@/lib/public-activity-query";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const filters = parseActivityFilters(Object.fromEntries(url.searchParams.entries()));
  const feed = await getPublicActivityFeed({ ...filters, limit: 96 });

  return new Response(buildPublicCalendarFeed(feed.activities), {
    headers: {
      ...publicApiHeaders(mobileApiVersion),
      "Content-Disposition": 'inline; filename="zuidlaren-agenda.ics"',
      "Content-Type": "text/calendar; charset=utf-8",
    },
  });
}
