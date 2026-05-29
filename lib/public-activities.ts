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

export type PublicActivityPage = Omit<PublicActivityFeed, "filterOptions">;

export async function getPublicFilterOptions(): Promise<ActivityFilterOptions> {
  const [categories, activityRows, locations] = await Promise.all([
    prisma.activityCategory.findMany({ orderBy: { name: "asc" } }),
    prisma.activity.findMany({
      where: { status: "PUBLISHED" },
      select: {
        category: { select: { name: true, slug: true } },
        indoorOutdoor: true,
        organizerName: true,
        typeTags: true,
      },
    }),
    prisma.location.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
  ]);
  const categoryMap = new Map<string, string>();
  const indoorOutdoor = new Set<string>();
  const organizers = new Set<string>();
  const types = new Set<string>();

  for (const category of categories) {
    categoryMap.set(category.slug, category.name);
  }

  for (const row of activityRows) {
    categoryMap.set(row.category.slug, row.category.name);
    if (row.indoorOutdoor) indoorOutdoor.add(row.indoorOutdoor);
    if (row.organizerName) organizers.add(row.organizerName);

    for (const tag of row.typeTags) {
      types.add(tag);
    }
  }

  return {
    categories: [...categoryMap.entries()].map(([value, label]) => ({ label, value })).sort((a, b) => a.label.localeCompare(b.label, "nl")),
    indoorOutdoor: [...indoorOutdoor].sort((a, b) => a.localeCompare(b, "nl")),
    locations: locations.map((location) => location.name),
    organizers: [...organizers].sort((a, b) => a.localeCompare(b, "nl")),
    types: [...types].sort((a, b) => a.localeCompare(b, "nl")),
  };
}

export async function getPublicActivityPage(filters: ActivityFilterState, currentUserId?: string): Promise<PublicActivityPage> {
  const cursorWhere = buildPublicActivityCursorWhere(filters.cursor);
  const where = cursorWhere ? { AND: [buildActivityWhere(filters, currentUserId), cursorWhere] } : buildActivityWhere(filters, currentUserId);
  const activities = await prisma.activity.findMany({
    where,
    include: {
      category: true,
      location: true,
      _count: {
        select: {
          attendances: {
            where: {
              status: "GOING",
              visibility: "PUBLIC",
            },
          },
        },
      },
      ...(currentUserId
        ? {
            attendances: {
              where: { userId: currentUserId },
              select: { status: true, visibility: true },
              take: 1,
            },
          }
        : {}),
    },
    take: filters.limit + 1,
    orderBy: [{ startAt: "asc" }, { slug: "asc" }],
  });
  const hasMore = activities.length > filters.limit;
  const visibleActivities = hasMore ? activities.slice(0, filters.limit) : activities;
  const lastVisibleActivity = visibleActivities.at(-1);

  return {
    activities: visibleActivities.map(mapActivityRecord),
    hasMore,
    limit: filters.limit,
    nextCursor: hasMore && lastVisibleActivity ? buildPublicActivityCursor({ slug: lastVisibleActivity.slug, startAt: lastVisibleActivity.startAt }) : null,
  };
}

export async function getPublicActivityFeed(filters: ActivityFilterState, currentUserId?: string): Promise<PublicActivityFeed> {
  const [page, filterOptions] = await Promise.all([getPublicActivityPage(filters, currentUserId), getPublicFilterOptions()]);

  return {
    ...page,
    filterOptions,
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
      _count: {
        select: {
          attendances: {
            where: {
              status: "GOING",
              visibility: "PUBLIC",
            },
          },
        },
      },
    },
  });

  return activity ? mapActivityRecord(activity) : null;
}
