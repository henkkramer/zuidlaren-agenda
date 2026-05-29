import type { ReactNode } from "react";
import { ActivityCard } from "@/components/activity-card";
import { BottomNavigation } from "@/components/bottom-navigation";
import { ChurchMark } from "@/components/church-mark";
import { FilterControls } from "@/components/filter-controls";
import { MobileHeader } from "@/components/mobile-header";
import { CalendarPlus } from "lucide-react";
import type { Activity } from "@/lib/activity-types";
import { toQueryString, type ActivityFilterOptions, type ActivityFilterState } from "@/lib/public-activity-query";

const emptyFilterOptions: ActivityFilterOptions = { categories: [], indoorOutdoor: [], locations: [], organizers: [], types: [] };

export function BrandHeader() {
  return (
    <header className="brand-strip">
      <ChurchMark />
      <div>
        <h1 className="brand-title">
          Zuidlaren
          <span>Agenda</span>
        </h1>
        <p className="brand-subtitle">Ontdek activiteiten in en rondom Zuidlaren</p>
      </div>
    </header>
  );
}

export function AgendaShellFrame({ children }: { children: ReactNode }) {
  return (
    <main className="app-page" id="main-content">
      <BrandHeader />
      <div className="app-container">
        <section className="agenda-surface">{children}</section>
      </div>
      <BottomNavigation />
    </main>
  );
}

export function FilterControlsSkeleton() {
  return (
    <div className="agenda-skeleton-block" aria-label="Filters laden">
      <div className="skeleton-line wide" />
      <div className="skeleton-chip-row">
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="skeleton-menu-row">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

export function ActivityFeedSkeleton() {
  return (
    <div className="feed-list skeleton-feed" aria-label="Activiteiten laden">
      {Array.from({ length: 4 }).map((_, index) => (
        <div className="activity-card skeleton-card" key={index}>
          <span className="skeleton-date" />
          <span className="skeleton-title" />
          <span className="skeleton-meta" />
        </div>
      ))}
    </div>
  );
}

export function PublicAgendaControls({ filterOptions, filters }: { filterOptions: ActivityFilterOptions; filters: ActivityFilterState }) {
  return <FilterControls filters={filters} options={filterOptions} />;
}

export function PublicActivityFeed({ activities, filters, hasMore }: { activities: Activity[]; filters: ActivityFilterState; hasMore: boolean }) {
  const moreQuery = toQueryString({ ...filters, cursor: undefined }, { limit: filters.limit + 24 });
  const calendarQuery = toQueryString({ ...filters, cursor: undefined }, { limit: 96 });
  const calendarHref = calendarQuery ? "/api/public/calendar?" + calendarQuery : "/api/public/calendar";

  return (
    <>
      <div className="feed-summary">
        <span>{activities.length} activiteiten</span>
        <a className="calendar-feed-link" href={calendarHref}>
          <CalendarPlus size={14} />
          Abonneer
        </a>
      </div>
      <div className="feed-list">
        {activities.map((activity, index) => (
          <ActivityCard activity={activity} enableFilterLinks key={activity.id} priority={index < 2} />
        ))}
      </div>
      {activities.length === 0 ? (
        <div className="empty-state feed-empty-state">
          <h2>Geen activiteiten gevonden</h2>
          <p>Pas je filters aan of wis alle filters om opnieuw te zoeken.</p>
        </div>
      ) : null}
      {hasMore ? (
        <a className="load-more-link" href={"/?" + moreQuery}>
          Meer laden
        </a>
      ) : null}
    </>
  );
}

export function ZuidlarenAgendaShell({
  filterOptions,
  filters,
  hasMore = false,
  initialActivities,
}: {
  filterOptions?: ActivityFilterOptions;
  filters?: ActivityFilterState;
  hasMore?: boolean;
  initialActivities?: Activity[];
}) {
  const activities = initialActivities ?? [];
  const activeFilters = filters ?? { limit: 50 };
  const options = filterOptions ?? emptyFilterOptions;

  return (
    <AgendaShellFrame>
      <MobileHeader />
      <PublicAgendaControls filterOptions={options} filters={activeFilters} />
      <PublicActivityFeed activities={activities} filters={activeFilters} hasMore={hasMore} />
    </AgendaShellFrame>
  );
}
