"use client";

import { useState } from "react";
import { CalendarPlus } from "lucide-react";
import { ActivityCard } from "@/components/activity-card";
import { ActivityDetailView } from "@/components/activity-detail-view";
import type { Activity } from "@/lib/activity-types";

type PersonalAgendaItem = {
  activity: Activity;
  attendance: {
    status: "going" | "maybe";
    visibility: "private" | "public";
  };
};

export function PersonalAgendaShell({ items }: { items: PersonalAgendaItem[] }) {
  const [agendaItems, setAgendaItems] = useState(items);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  async function removeAttendance(activityId: string) {
    const response = await fetch(`/api/activities/${encodeURIComponent(activityId)}/attendance`, {
      method: "DELETE",
    });

    if (!response.ok) {
      return;
    }

    setAgendaItems((currentItems) => currentItems.filter((item) => item.activity.id !== activityId));
    if (selectedActivity?.id === activityId) {
      setSelectedActivity(null);
    }
  }

  if (selectedActivity) {
    return (
      <div className="personal-detail-frame">
        <ActivityDetailView activity={selectedActivity} onBack={() => setSelectedActivity(null)} />
        <div className="personal-detail-actions">
          <button className="outline-button" onClick={() => removeAttendance(selectedActivity.id)} type="button">
            Verwijderen uit mijn agenda
          </button>
        </div>
      </div>
    );
  }

  if (agendaItems.length === 0) {
    return (
      <div className="empty-state">
        <h2>Nog geen activiteiten</h2>
        <p>Kies bij een activiteit voor Ik ga. Je keuzes blijven standaard alleen zichtbaar voor jou.</p>
      </div>
    );
  }

  return (
    <>
      <div className="feed-summary personal-summary">
        <span>{agendaItems.length} gekozen activiteiten</span>
        <a className="calendar-feed-link" href="/api/me/agenda/calendar">
          <CalendarPlus size={14} />
          Exporteer
        </a>
      </div>
      <div className="feed-list personal-feed-list">
        {agendaItems.map((item) => (
          <div className="personal-agenda-item" key={item.activity.id}>
            <ActivityCard activity={item.activity} onOpen={setSelectedActivity} />
            <div className="personal-agenda-meta">
              <span>{item.attendance.visibility === "private" ? "Alleen zichtbaar voor mij" : "Publiek zichtbaar"}</span>
              <button onClick={() => removeAttendance(item.activity.id)} type="button">
                Verwijderen
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
