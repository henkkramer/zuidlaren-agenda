"use client";

import { useState } from "react";

type AdminActivityStatus = "draft" | "scheduled" | "published" | "unpublished" | "expired";

type AdminActivityItem = {
  id: string;
  organizerName: string;
  status: AdminActivityStatus;
  title: string;
};

const statusLabels: Record<AdminActivityStatus, string> = {
  draft: "concept",
  expired: "verlopen",
  published: "gepubliceerd",
  scheduled: "ingepland",
  unpublished: "verborgen",
};

export function AdminActivities({ activities }: { activities: AdminActivityItem[] }) {
  const [items, setItems] = useState(activities);
  const [status, setStatus] = useState("");

  async function updateActivity(activityId: string, nextStatus: AdminActivityStatus) {
    setStatus("Activiteit bijwerken...");
    const response = await fetch(`/api/admin/activities/${activityId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    const body = (await response.json().catch(() => null)) as { activity?: { status: string }; error?: string } | null;

    if (!response.ok || !body?.activity) {
      setStatus(body?.error ?? "Activiteit kon niet worden bijgewerkt");
      return;
    }

    setItems((current) =>
      current.map((activity) =>
        activity.id === activityId ? { ...activity, status: body.activity?.status.toLowerCase() as AdminActivityStatus } : activity,
      ),
    );
    setStatus("Activiteitstatus bijgewerkt en vastgelegd in de auditlog.");
  }

  return (
    <div className="admin-table">
      {items.map((activity) => (
        <div className="admin-row" key={activity.id}>
          <span>
            <strong>{activity.title}</strong>
            <small>{activity.organizerName}</small>
          </span>
          <span className="business-row-actions">
            <span className="status-pill">{statusLabels[activity.status] ?? activity.status}</span>
            {activity.status !== "published" ? (
              <button className="status-pill admin-inline-button" onClick={() => updateActivity(activity.id, "published")} type="button">
                Publiceren
              </button>
            ) : null}
            {activity.status !== "unpublished" ? (
              <button className="status-pill admin-inline-button" onClick={() => updateActivity(activity.id, "unpublished")} type="button">
                Verbergen
              </button>
            ) : null}
            {activity.status !== "expired" ? (
              <button className="status-pill admin-inline-button" onClick={() => updateActivity(activity.id, "expired")} type="button">
                Verlopen
              </button>
            ) : null}
          </span>
        </div>
      ))}
      {status ? <p className="small-muted">{status}</p> : null}
    </div>
  );
}
