import { ActivityCard } from "@/components/activity-card";
import { BottomNavigation } from "@/components/bottom-navigation";
import { ChurchMark } from "@/components/church-mark";
import { FilterControls } from "@/components/filter-controls";
import { MobileHeader } from "@/components/mobile-header";
import { CalendarPlus } from "lucide-react";
import type { Activity } from "@/lib/activity-types";
import { toQueryString, type ActivityFilterOptions, type ActivityFilterState } from "@/lib/public-activity-query";

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

function PublicAgenda({
  activities,
  filterOptions,
  filters,
  hasMore,
}: {
  activities: Activity[];
  filterOptions: ActivityFilterOptions;
  filters: ActivityFilterState;
  hasMore: boolean;
}) {
  const moreQuery = toQueryString({ ...filters, cursor: undefined }, { limit: filters.limit + 24 });
  const calendarQuery = toQueryString({ ...filters, cursor: undefined }, { limit: 96 });
  const calendarHref = calendarQuery ? `/api/public/calendar?${calendarQuery}` : "/api/public/calendar";

  return (
    <>
      <MobileHeader />
      <div className="feed-summary">
        <span>{activities.length} activiteiten</span>
        <a className="calendar-feed-link" href={calendarHref}>
          <CalendarPlus size={14} />
          Abonneer
        </a>
      </div>
      <FilterControls filters={filters} options={filterOptions} />
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
        <a className="load-more-link" href={`/?${moreQuery}`}>
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
  const options = filterOptions ?? { categories: [], indoorOutdoor: [], locations: [], organizers: [], types: [] };

  return (
    <main className="app-page" id="main-content">
      <BrandHeader />
      <div className="app-container">
        <section className="agenda-surface">
          <PublicAgenda activities={activities} filterOptions={options} filters={activeFilters} hasMore={hasMore} />
        </section>
      </div>
      <BottomNavigation />
    </main>
  );
}
