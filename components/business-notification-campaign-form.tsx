"use client";

import { useState } from "react";

type BusinessNotificationCampaignFormProps = {
  businessSlug: string;
  activities: Array<{ id: string; title: string }>;
};

export function BusinessNotificationCampaignForm({ businessSlug, activities }: BusinessNotificationCampaignFormProps) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [activityId, setActivityId] = useState(activities[0]?.id ?? "");
  const [status, setStatus] = useState("");

  async function requestCampaign() {
    setStatus("Aanvraag opslaan...");
    const response = await fetch(`/api/businesses/${businessSlug}/notification-campaigns`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, message, activityId }),
    });
    const body = (await response.json().catch(() => null)) as { error?: string; campaign?: { deliveryCount: number } } | null;

    if (!response.ok) {
      setStatus(body?.error ?? "Aanvraag kon niet worden opgeslagen");
      return;
    }

    setTitle("");
    setMessage("");
    setStatus(`Aanvraag opgeslagen voor admincontrole. Doelgroep: ${body?.campaign?.deliveryCount ?? 0} ontvangers.`);
  }

  return (
    <div className="notification-campaign-form">
      <label>
        Activiteit
        <select onChange={(event) => setActivityId(event.target.value)} value={activityId}>
          {activities.map((activity) => (
            <option key={activity.id} value={activity.id}>
              {activity.title}
            </option>
          ))}
        </select>
      </label>
      <label>
        Titel
        <input maxLength={120} onChange={(event) => setTitle(event.target.value)} value={title} />
      </label>
      <label>
        Bericht
        <textarea maxLength={1000} onChange={(event) => setMessage(event.target.value)} rows={4} value={message} />
      </label>
      <button className="outline-button" onClick={requestCampaign} type="button">
        Notificatie aanvragen
      </button>
      {status ? <p className="small-muted">{status}</p> : null}
    </div>
  );
}
