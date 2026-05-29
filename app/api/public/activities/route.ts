import { NextResponse, after } from "next/server";
import { publicApiHeaders } from "@/lib/api-response";
import { hasActiveFilterDimensions, recordAnalyticsMetric } from "@/lib/analytics";
import { mobileApiVersion } from "@/lib/mobile-contracts";
import { getPublicActivityFeed } from "@/lib/public-activities";
import { parseActivityFilters } from "@/lib/public-activity-query";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const filters = parseActivityFilters(Object.fromEntries(url.searchParams.entries()));
  const feed = await getPublicActivityFeed(filters);

  after(() => recordAnalyticsMetric({
    metric: "public_activity_list",
    dimensions: {
      endpoint: "public_api",
      filtered: hasActiveFilterDimensions(filters),
      hasMore: feed.hasMore,
      limit: feed.limit,
    },
  }));

  return NextResponse.json(
    {
      apiVersion: mobileApiVersion,
      data: {
        activities: feed.activities,
        filterOptions: feed.filterOptions,
      },
      meta: {
        hasMore: feed.hasMore,
        limit: feed.limit,
        nextCursor: feed.nextCursor,
        sort: "startDateTime:asc,id:asc",
      },
    },
    { headers: publicApiHeaders(mobileApiVersion) },
  );
}
