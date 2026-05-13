import { ZuidlarenAgendaShell } from "@/components/zuidlaren-agenda-shell";
import { hasActiveFilterDimensions, recordAnalyticsMetric } from "@/lib/analytics";
import { mapActivityRecord } from "@/lib/activity-mapper";
import { prisma } from "@/lib/prisma";
import { buildActivityWhere, parseActivityFilters, type ActivityFilterOptions } from "@/lib/public-activity-query";

export const dynamic = "force-dynamic";

type HomePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Home({ searchParams }: HomePageProps) {
  const filters = parseActivityFilters(await searchParams);
  const where = buildActivityWhere(filters);
  const activities = await prisma.activity.findMany({
    where,
    include: {
      category: true,
      location: true,
    },
    take: filters.limit + 1,
    orderBy: { startAt: "asc" },
  });
  const [categories, locations, organizers, typeRows, indoorOutdoorRows] = await Promise.all([
    prisma.activityCategory.findMany({ orderBy: { name: "asc" } }),
    prisma.location.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
    prisma.activity.findMany({ where: { status: "PUBLISHED" }, distinct: ["organizerName"], orderBy: { organizerName: "asc" }, select: { organizerName: true } }),
    prisma.activity.findMany({ where: { status: "PUBLISHED" }, select: { typeTags: true } }),
    prisma.activity.findMany({ where: { status: "PUBLISHED", indoorOutdoor: { not: null } }, distinct: ["indoorOutdoor"], select: { indoorOutdoor: true } }),
  ]);
  const hasMore = activities.length > filters.limit;
  const visibleActivities = hasMore ? activities.slice(0, filters.limit) : activities;
  const filterOptions: ActivityFilterOptions = {
    categories: categories.map((category) => ({ label: category.name, value: category.slug })),
    indoorOutdoor: indoorOutdoorRows.map((row) => row.indoorOutdoor).filter((value): value is string => Boolean(value)).sort(),
    locations: locations.map((location) => location.name),
    organizers: organizers.map((row) => row.organizerName),
    types: [...new Set(typeRows.flatMap((row) => row.typeTags))].sort((a, b) => a.localeCompare(b, "nl")),
  };

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
      filterOptions={filterOptions}
      filters={filters}
      hasMore={hasMore}
      initialActivities={visibleActivities.map(mapActivityRecord)}
    />
  );
}
