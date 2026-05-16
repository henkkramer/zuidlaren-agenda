import "server-only";

import { mapActivityRecord } from "@/lib/activity-mapper";
import type { Activity } from "@/lib/activity-types";
import { prisma } from "@/lib/prisma";
import { buildPublicActivityCursor, buildPublicActivityCursorWhere } from "@/lib/public-activity-pagination";
import { buildActivityWhere, type ActivityFilterOptions, type ActivityFilterState } from "@/lib/public-activity-query";

export type PublicActivityFeed = {
  activities: Activity[];
  filterOptions: ActivityFilterOptions;
  hasMore: boolean;
  limit: number;
  nextCursor: string | null;
};

export async function getPublicFilterOptions(): Promise<ActivityFilterOptions> {
  const [categories, activityCategoryRows, locations, organizers, typeRows, indoorOutdoorRows] = await Promise.all([
    prisma.activityCategory.findMany({ orderBy: { name: "asc" } }),
    prisma.activity.findMany({
      where: { status: "PUBLISHED" },
      select: { category: { select: { name: true, slug: true } } },
    }),
    prisma.location.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
    prisma.activity.findMany({ where: { status: "PUBLISHED" }, distinct: ["organizerName"], orderBy: { organizerName: "asc" }, select: { organizerName: true } }),
    prisma.activity.findMany({ where: { status: "PUBLISHED" }, select: { typeTags: true } }),
    prisma.activity.findMany({ where: { status: "PUBLISHED", indoorOutdoor: { not: null } }, distinct: ["indoorOutdoor"], select: { indoorOutdoor: true } }),
  ]);
  const categoryMap = new Map<string, string>();

  for (const category of categories) {
    categoryMap.set(category.slug, category.name);
  }

  for (const row of activityCategoryRows) {
    categoryMap.set(row.category.slug, row.category.name);
  }

  return {
    categories: [...categoryMap.entries()].map(([value, label]) => ({ label, value })).sort((a, b) => a.label.localeCompare(b.label, "nl")),
    indoorOutdoor: indoorOutdoorRows.map((row) => row.indoorOutdoor).filter((value): value is string => Boolean(value)).sort(),
    locations: locations.map((location) => location.name),
    organizers: organizers.map((row) => row.organizerName),
    types: [...new Set(typeRows.flatMap((row) => row.typeTags))].sort((a, b) => a.localeCompare(b, "nl")),
  };
}

export async function getPublicActivityFeed(filters: ActivityFilterState): Promise<PublicActivityFeed> {
  const cursorWhere = buildPublicActivityCursorWhere(filters.cursor);
  const where = cursorWhere ? { AND: [buildActivityWhere(filters), cursorWhere] } : buildActivityWhere(filters);
  const [activities, filterOptions] = await Promise.all([
    prisma.activity.findMany({
      where,
      include: {
        category: true,
        location: true,
      },
      take: filters.limit + 1,
      orderBy: [{ startAt: "asc" }, { slug: "asc" }],
    }),
    getPublicFilterOptions(),
  ]);
  const hasMore = activities.length > filters.limit;
  const visibleActivities = hasMore ? activities.slice(0, filters.limit) : activities;
  const lastVisibleActivity = visibleActivities.at(-1);

  return {
    activities: visibleActivities.map(mapActivityRecord),
    filterOptions,
    hasMore,
    limit: filters.limit,
    nextCursor: hasMore && lastVisibleActivity ? buildPublicActivityCursor({ slug: lastVisibleActivity.slug, startAt: lastVisibleActivity.startAt }) : null,
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
