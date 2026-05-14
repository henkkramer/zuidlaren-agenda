import { NextResponse } from "next/server";
import { mobileApiVersion } from "@/lib/mobile-contracts";
import { getPublicActivityFeed } from "@/lib/public-activities";
import { parseActivityFilters } from "@/lib/public-activity-query";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const filters = parseActivityFilters(Object.fromEntries(url.searchParams.entries()));
  const feed = await getPublicActivityFeed(filters);

  return NextResponse.json({
    apiVersion: mobileApiVersion,
    data: {
      activities: feed.activities,
      filterOptions: feed.filterOptions,
    },
    meta: {
      hasMore: feed.hasMore,
      limit: feed.limit,
      sort: "startDateTime:asc",
    },
  });
}
