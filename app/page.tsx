import { Suspense } from "react";
import { after } from "next/server";
import {
  ActivityFeedSkeleton,
  AgendaShellFrame,
  FilterControlsSkeleton,
  PublicActivityFeed,
  PublicAgendaControls,
} from "@/components/zuidlaren-agenda-shell";
import { MobileHeader } from "@/components/mobile-header";
import { hasActiveFilterDimensions, recordAnalyticsMetric } from "@/lib/analytics";
import { getCurrentSession } from "@/lib/auth";
import { getPublicActivityPage, getPublicFilterOptions } from "@/lib/public-activities";
import { parseActivityFilters, type ActivityFilterState } from "@/lib/public-activity-query";

export const revalidate = 60;

type HomePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

async function HomeFilterControls({ filters }: { filters: ActivityFilterState }) {
  const filterOptions = await getPublicFilterOptions();
  return <PublicAgendaControls filterOptions={filterOptions} filters={filters} />;
}

async function HomeActivityFeed({ filters }: { filters: ActivityFilterState }) {
  const session = await getCurrentSession();
  const feed = await getPublicActivityPage(filters, session?.user?.id);
  return <PublicActivityFeed activities={feed.activities} filters={filters} hasMore={feed.hasMore} />;
}

export default async function Home({ searchParams }: HomePageProps) {
  const filters = parseActivityFilters(await searchParams);

  if (hasActiveFilterDimensions(filters)) {
    after(() => recordAnalyticsMetric({
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
    }));
  }

  return (
    <AgendaShellFrame>
      <MobileHeader />
      <Suspense fallback={<FilterControlsSkeleton />}>
        <HomeFilterControls filters={filters} />
      </Suspense>
      <Suspense fallback={<ActivityFeedSkeleton />}>
        <HomeActivityFeed filters={filters} />
      </Suspense>
    </AgendaShellFrame>
  );
}
