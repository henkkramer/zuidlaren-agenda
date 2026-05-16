"use client";

import { useState } from "react";
import { ActivityCard } from "@/components/activity-card";
import { ActivityDetailView } from "@/components/activity-detail-view";
import { BottomNavigation } from "@/components/bottom-navigation";
import { ChurchMark } from "@/components/church-mark";
import { FilterControls } from "@/components/filter-controls";
import { MobileHeader } from "@/components/mobile-header";
import type { Activity } from "@/lib/activity-types";
import { getPublicActivities } from "@/lib/activity-service";
import { toQueryString, type ActivityFilterOptions, type ActivityFilterState } from "@/lib/public-activity-query";

function BrandHeader() {
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
  onOpen,
}: {
  activities: Activity[];
  filterOptions: ActivityFilterOptions;
  filters: ActivityFilterState;
  hasMore: boolean;
  onOpen: (activity: Activity) => void;
}) {
  const moreQuery = toQueryString({ ...filters, cursor: undefined }, { limit: filters.limit + 24 });

  return (
    <>
      <MobileHeader />
      <div className="feed-summary">
        <span>{activities.length} activiteiten</span>
        <span>Mei t/m december 2026</span>
      </div>
      <FilterControls filters={filters} options={filterOptions} />
      <div className="feed-list">
        {activities.map((activity) => (
          <ActivityCard activity={activity} key={activity.id} onOpen={onOpen} />
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
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const activities = initialActivities?.length ? initialActivities : getPublicActivities();
  const activeFilters = filters ?? { limit: 24 };
  const options = filterOptions ?? { categories: [], indoorOutdoor: [], locations: [], organizers: [], types: [] };

  function openActivity(activity: Activity) {
    setSelectedActivity(activity);
    void fetch("/api/analytics/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "activity_view", activityId: activity.id }),
    });
  }

  return (
    <main className="app-page" id="main-content">
      <BrandHeader />
      <div className="app-container">
        <section className="agenda-surface">
          {selectedActivity ? (
            <ActivityDetailView activity={selectedActivity} onBack={() => setSelectedActivity(null)} />
          ) : (
            <PublicAgenda activities={activities} filterOptions={options} filters={activeFilters} hasMore={hasMore} onOpen={openActivity} />
          )}
        </section>
      </div>
      <BottomNavigation />
    </main>
  );
}
