import "server-only";

import { mapActivityRecord } from "@/lib/activity-mapper";
import type { Activity } from "@/lib/activity-types";
import { prisma } from "@/lib/prisma";
import { buildActivityWhere, type ActivityFilterOptions, type ActivityFilterState } from "@/lib/public-activity-query";

export type PublicActivityFeed = {
  activities: Activity[];
  filterOptions: ActivityFilterOptions;
  hasMore: boolean;
  limit: number;
};

export async function getPublicFilterOptions(): Promise<ActivityFilterOptions> {
  const [categories, locations, organizers, typeRows, indoorOutdoorRows] = await Promise.all([
    prisma.activityCategory.findMany({ orderBy: { name: "asc" } }),
    prisma.location.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
    prisma.activity.findMany({ where: { status: "PUBLISHED" }, distinct: ["organizerName"], orderBy: { organizerName: "asc" }, select: { organizerName: true } }),
    prisma.activity.findMany({ where: { status: "PUBLISHED" }, select: { typeTags: true } }),
    prisma.activity.findMany({ where: { status: "PUBLISHED", indoorOutdoor: { not: null } }, distinct: ["indoorOutdoor"], select: { indoorOutdoor: true } }),
  ]);

  return {
    categories: categories.map((category) => ({ label: category.name, value: category.slug })),
    indoorOutdoor: indoorOutdoorRows.map((row) => row.indoorOutdoor).filter((value): value is string => Boolean(value)).sort(),
    locations: locations.map((location) => location.name),
    organizers: organizers.map((row) => row.organizerName),
    types: [...new Set(typeRows.flatMap((row) => row.typeTags))].sort((a, b) => a.localeCompare(b, "nl")),
  };
}

export async function getPublicActivityFeed(filters: ActivityFilterState): Promise<PublicActivityFeed> {
  const [activities, filterOptions] = await Promise.all([
    prisma.activity.findMany({
      where: buildActivityWhere(filters),
      include: {
        category: true,
        location: true,
      },
      take: filters.limit + 1,
      orderBy: { startAt: "asc" },
    }),
    getPublicFilterOptions(),
  ]);
  const hasMore = activities.length > filters.limit;
  const visibleActivities = hasMore ? activities.slice(0, filters.limit) : activities;

  return {
    activities: visibleActivities.map(mapActivityRecord),
    filterOptions,
    hasMore,
    limit: filters.limit,
  };
}

export async function getPublicActivityDetail(activityId: string) {
  const activity = await prisma.activity.findFirst({
    where: {
      slug: decodeURIComponent(activityId),
      status: "PUBLISHED",
    },
    include: {
      category: true,
      location: true,
    },
  });

  return activity ? mapActivityRecord(activity) : null;
}
