"use client";

import { useState } from "react";

type AdminReportStatus = "open" | "reviewed" | "dismissed";

type AdminReportItem = {
  id: string;
  activityTitle: string;
  createdAt: string;
  details: string | null;
  reason: string;
  reporterLabel: string;
  resolution: string | null;
  status: AdminReportStatus;
};

const statusLabels: Record<AdminReportStatus, string> = {
  dismissed: "afgewezen",
  open: "open",
  reviewed: "behandeld",
};

function nextResolution(status: AdminReportStatus, currentResolution: string | null) {
  if (currentResolution) return currentResolution;
  if (status === "reviewed") return "Behandeld door beheer.";
  if (status === "dismissed") return "Geen verdere actie nodig.";
  return "";
}

export function AdminReports({ reports }: { reports: AdminReportItem[] }) {
  const [items, setItems] = useState(reports);
  const [status, setStatus] = useState("");

  async function updateReport(reportId: string, nextStatus: AdminReportStatus) {
    const report = items.find((item) => item.id === reportId);
    setStatus("Melding bijwerken...");

    const response = await fetch(`/api/admin/reports/${reportId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resolution: nextResolution(nextStatus, report?.resolution ?? null),
        status: nextStatus,
      }),
    });
    const body = (await response.json().catch(() => null)) as { error?: string; report?: { resolution: string | null; status: string } } | null;

    if (!response.ok || !body?.report) {
      setStatus(body?.error ?? "Melding kon niet worden bijgewerkt");
      return;
    }

    setItems((current) =>
      current.map((item) =>
        item.id === reportId
          ? {
              ...item,
              resolution: body.report?.resolution ?? item.resolution,
              status: body.report?.status.toLowerCase() as AdminReportStatus,
            }
          : item,
      ),
    );
    setStatus("Melding bijgewerkt en vastgelegd in de auditlog.");
  }

  return (
    <div className="admin-table">
      {items.length === 0 ? <p className="account-muted">Geen meldingen.</p> : null}
      {items.map((report) => (
        <article className="admin-report-row" key={report.id}>
          <div className="admin-report-main">
            <div>
              <strong>{report.reason}</strong>
              <small>
                {report.activityTitle} · {report.reporterLabel} · {report.createdAt}
              </small>
            </div>
            {report.details ? <p>{report.details}</p> : null}
            {report.resolution ? <p className="small-muted">Afhandeling: {report.resolution}</p> : null}
          </div>
          <div className="admin-report-actions">
            <span className="status-pill">{statusLabels[report.status] ?? report.status}</span>
            {report.status !== "reviewed" ? (
              <button className="status-pill admin-inline-button" onClick={() => updateReport(report.id, "reviewed")} type="button">
                Behandeld
              </button>
            ) : null}
            {report.status !== "dismissed" ? (
              <button className="status-pill admin-inline-button" onClick={() => updateReport(report.id, "dismissed")} type="button">
                Afwijzen
              </button>
            ) : null}
            {report.status !== "open" ? (
              <button className="status-pill admin-inline-button" onClick={() => updateReport(report.id, "open")} type="button">
                Heropenen
              </button>
            ) : null}
          </div>
        </article>
      ))}
      {status ? <p className="small-muted">{status}</p> : null}
    </div>
  );
}
