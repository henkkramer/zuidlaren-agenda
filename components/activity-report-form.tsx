"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { AlertTriangle, ChevronDown, Send } from "lucide-react";
import type { Activity } from "@/lib/activity-types";

const reasonOptions = ["Onjuiste datum of tijd", "Onjuiste locatie", "Activiteit gaat niet door", "Ongepaste of misleidende informatie", "Anders"];

export function ActivityReportForm({ activity }: { activity: Activity }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(reasonOptions[0]);
  const [details, setDetails] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submitReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("Melding versturen...");

    const response = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        activityId: activity.id,
        details,
        reason,
      }),
    });

    if (response.ok) {
      setStatus("success");
      setMessage("Bedankt, je melding is ontvangen.");
      setDetails("");
      return;
    }

    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    setStatus("error");
    setMessage(payload?.error ?? "Melding kon niet worden verstuurd.");
  }

  return (
    <section className="report-panel" aria-label="Probleem melden">
      <button className="report-toggle" type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open}>
        <span>
          <AlertTriangle size={18} />
          Probleem melden
        </span>
        <ChevronDown className={open ? "rotated" : ""} size={18} aria-hidden="true" />
      </button>
      {open ? (
        <form className="report-form" onSubmit={submitReport}>
          <label>
            Reden
            <select value={reason} onChange={(event) => setReason(event.target.value)}>
              {reasonOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label>
            Toelichting
            <textarea
              maxLength={1000}
              onChange={(event) => setDetails(event.target.value)}
              placeholder="Wat klopt er niet?"
              rows={4}
              value={details}
            />
          </label>
          <button className="primary-button" disabled={status === "sending"} type="submit">
            Verstuur melding <Send size={17} />
          </button>
          {message ? <p className={`action-status ${status === "error" ? "error" : ""}`}>{message}</p> : null}
        </form>
      ) : null}
    </section>
  );
}
