import { ZuidlarenAgendaShell } from "@/components/zuidlaren-agenda-shell";
import { hasActiveFilterDimensions, recordAnalyticsMetric } from "@/lib/analytics";
import { getPublicActivityFeed } from "@/lib/public-activities";
import { parseActivityFilters } from "@/lib/public-activity-query";

export const dynamic = "force-dynamic";

type HomePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Home({ searchParams }: HomePageProps) {
  const filters = parseActivityFilters(await searchParams);
  const feed = await getPublicActivityFeed(filters);

  if (hasActiveFilterDimensions(filters)) {
    await recordAnalyticsMetric({
      metric: "filter_use",
      category: filters.category,
      location: filters.location,
      dimensions: {
        period: filters.period,
        type: filters.type,
        organizer: filters.organizer ? "selected" : undefined,
        indoorOutdoor: filters.indoorOutdoor,
        family: filters.family,
        price: filters.price,
        dateRange: filters.start || filters.end ? true : undefined,
        hasSearch: filters.q ? true : undefined,
      },
    });
  }

  return (
    <ZuidlarenAgendaShell
      filterOptions={feed.filterOptions}
      filters={filters}
      hasMore={feed.hasMore}
      initialActivities={feed.activities}
    />
  );
}
