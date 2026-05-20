"use client";

import { useState } from "react";
import { ArrowLeft, Bookmark, CalendarDays, CalendarPlus, ExternalLink, Lock, MapPin, Share2, Users, UserRound } from "lucide-react";
import { ActivityReportForm } from "@/components/activity-report-form";
import { ActivityDateBadge } from "@/components/activity-date-badge";
import { categoryLabels, type Activity } from "@/lib/activity-types";
import { activityDateParts, formatActivityEndTime } from "@/lib/date-format";

export function ActivityDetailView({ activity, onBack }: { activity: Activity; onBack: () => void }) {
  const parts = activityDateParts(activity);
  const [visibility, setVisibility] = useState<"private" | "public">(activity.myAttendance?.visibility ?? "private");
  const [myAttendance, setMyAttendance] = useState(activity.myAttendance);
  const [publicGoingCount, setPublicGoingCount] = useState(activity.publicGoingCount ?? 0);
  const [status, setStatus] = useState("");

  async function markGoing() {
    setStatus("Opslaan...");
    const response = await fetch(`/api/activities/${encodeURIComponent(activity.id)}/attendance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "going", visibility }),
    });

    if (response.status === 401) {
      setStatus("Log eerst in om deze activiteit op te slaan.");
      return;
    }

    if (!response.ok) {
      setStatus("Kon activiteit niet opslaan");
      return;
    }

    const data = (await response.json()) as {
      attendance?: {
        status: "going" | "maybe";
        visibility: "private" | "public";
      };
      publicGoingCount?: number;
    };

    if (data.attendance) {
      setMyAttendance(data.attendance);
      setVisibility(data.attendance.visibility);
    }
    if (typeof data.publicGoingCount === "number") {
      setPublicGoingCount(data.publicGoingCount);
    }
    setStatus("Toegevoegd aan mijn agenda");
  }

  function trackSourceClick() {
    void fetch("/api/analytics/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "activity_source_click", activityId: activity.id }),
    });
  }

  return (
    <>
      <div className="detail-hero" style={{ backgroundImage: `url(${activity.imageUrl})` }}>
        <div className="detail-topbar">
          <button className="icon-button" onClick={onBack} aria-label="Terug">
            <ArrowLeft />
          </button>
          <div className="detail-actions">
            <button className="icon-button" aria-label="Delen">
              <Share2 />
            </button>
            <button className="icon-button" aria-label="Bewaren">
              <Bookmark />
            </button>
          </div>
        </div>
        <ActivityDateBadge activity={activity} />
      </div>
      <div className="detail-body">
        <h2>{activity.title}</h2>
        <div className="meta-line">
          <MapPin size={16} />
          {activity.locationName}
        </div>
        <div className="tag-row">
          <span className="tag light">{categoryLabels[activity.category]}</span>
          {activity.typeTags.map((tag) => (
            <span className="tag light" key={tag}>
              {tag}
            </span>
          ))}
        </div>
        <p>{activity.longDescription}</p>
        <div className="section-divider" />
        <h3>Praktische informatie</h3>
        <div className="info-list">
          <div className="info-row">
            <CalendarDays size={20} />
            <div>
              <strong>{parts.longDate}</strong>
              <span>
                {parts.time} - {formatActivityEndTime(activity)}
              </span>
            </div>
          </div>
          <div className="info-row">
            <MapPin size={20} />
            <div>
              <strong>{activity.locationName}</strong>
              <span>Bekijk op kaart</span>
            </div>
          </div>
          <div className="info-row">
            <UserRound size={20} />
            <div>
              <strong>Organisator</strong>
              <span>{activity.organizerName}</span>
            </div>
          </div>
          <div className="info-row">
            <ExternalLink size={20} />
            <div>
              <strong>Meer informatie</strong>
              <span>{activity.sourceUrl.replace("https://", "")}</span>
            </div>
          </div>
        </div>
        <div className="section-divider" />
        <h3>Ik ga</h3>
        <p className="account-muted">
          {myAttendance ? "Je gaat naar deze activiteit." : "Nog niet toegevoegd aan je agenda."}
          {publicGoingCount > 0 ? ` ${publicGoingCount} publiek zichtbaar.` : ""}
        </p>
        <div className="visibility-grid">
          <button
            className={`visibility-card ${visibility === "private" ? "active" : ""}`}
            onClick={() => setVisibility("private")}
            type="button"
          >
            <Lock size={18} /> Alleen zichtbaar voor mij
          </button>
          <button
            className={`visibility-card ${visibility === "public" ? "active" : ""}`}
            onClick={() => setVisibility("public")}
            type="button"
          >
            <Users size={18} /> Publiek zichtbaar bij deze activiteit
          </button>
        </div>
        <button className="primary-button" onClick={markGoing} type="button">
          {myAttendance ? "Ik ga bijwerken" : "Ik ga"}
        </button>
        {status ? <p className="action-status">{status}</p> : null}
        <div style={{ height: 12 }} />
        <a className="outline-button" href={`/api/public/activities/${encodeURIComponent(activity.id)}/calendar`}>
          Zet in agenda <CalendarPlus size={17} />
        </a>
        <div style={{ height: 10 }} />
        <a className="outline-button" href={activity.sourceUrl} onClick={trackSourceClick}>
          Open originele website <ExternalLink size={17} />
        </a>
        <ActivityReportForm activity={activity} />
      </div>
    </>
  );
}
