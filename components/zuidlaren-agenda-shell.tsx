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

function PublicAgenda({ onOpen }: { onOpen: (activity: Activity) => void }) {
  const activities = getPublicActivities();

  return (
    <>
      <MobileHeader />
      <div className="feed-summary">
        <span>{activities.length} activiteiten</span>
        <span>Mei t/m december 2026</span>
      </div>
      <FilterControls />
      <div className="feed-list">
        {activities.map((activity) => (
          <ActivityCard activity={activity} key={activity.id} onOpen={onOpen} />
        ))}
      </div>
    </>
  );
}

export function ZuidlarenAgendaShell() {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  return (
    <main className="app-page">
      <BrandHeader />
      <div className="app-container">
        <section className="agenda-surface">
          {selectedActivity ? (
            <ActivityDetailView activity={selectedActivity} onBack={() => setSelectedActivity(null)} />
          ) : (
            <PublicAgenda onOpen={setSelectedActivity} />
          )}
        </section>
      </div>
      <BottomNavigation />
    </main>
  );
}
