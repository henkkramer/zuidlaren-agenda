"use client";

import { useState } from "react";

type ScannerCandidate = {
  aiNotes: string[];
  confidence: number;
  id: string;
  locationName: string;
  organizerName: string;
  rejectionReason: string | null;
  sourceName: string;
  sourceUrl: string;
  startAt: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "DUPLICATE" | "NEEDS_REVIEW";
  title: string;
};

type ScannerSource = {
  enabled: boolean;
  id: string;
  kind: string;
  lastScannedAt: string | null;
  name: string;
};

type AdminAiActivityScannerProps = {
  candidates: ScannerCandidate[];
  sources: ScannerSource[];
};

export function AdminAiActivityScanner({ candidates, sources }: AdminAiActivityScannerProps) {
  const [items, setItems] = useState(candidates);
  const [status, setStatus] = useState("");
  const pendingCount = items.filter((item) => item.status === "PENDING" || item.status === "NEEDS_REVIEW").length;
  const rejectedCount = items.filter((item) => item.status === "REJECTED").length;

  async function runScan() {
    setStatus("Scan wordt gestart...");
    const response = await fetch("/api/admin/activity-scanner/scan-runs", { method: "POST" });

    if (!response.ok) {
      setStatus("Scan kon niet worden gestart");
      return;
    }

    setStatus("Scan afgerond. Ververs de pagina om nieuwe voorstellen te zien.");
  }

  async function reviewCandidate(candidateId: string, action: "approve" | "reject") {
    const reason = action === "reject" ? window.prompt("Waarom wijs je dit voorstel af?", "Niet relevant voor publieke agenda") ?? "" : "";
    setStatus(action === "approve" ? "Voorstel goedkeuren..." : "Voorstel afwijzen...");

    const response = await fetch(`/api/admin/activity-scanner/candidates/${candidateId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, reason }),
    });

    if (!response.ok) {
      setStatus("Voorstel kon niet worden verwerkt");
      return;
    }

    setItems((current) => current.map((item) => (item.id === candidateId ? { ...item, status: action === "approve" ? "APPROVED" : "REJECTED", rejectionReason: reason } : item)));
    setStatus(action === "approve" ? "Activiteit gepubliceerd" : "Voorstel opgeslagen als afgewezen");
  }

  return (
    <div className="admin-import-panel">
      <div className="admin-import-summary">
        <button className="primary-button" onClick={runScan} type="button">
          Scan voor nieuwe activiteiten
        </button>
        <span className="status-pill">{pendingCount} te beoordelen</span>
        <span className="status-pill">{rejectedCount} afgewezen</span>
      </div>

      <div className="admin-table">
        {sources.map((source) => (
          <div className="admin-row" key={source.id}>
            <span>
              <strong>{source.name}</strong>
              <small>
                {source.kind.toLowerCase()} · {source.enabled ? "actief" : "uit"} · laatst gescand {source.lastScannedAt ? new Date(source.lastScannedAt).toLocaleDateString("nl-NL") : "nog niet"}
              </small>
            </span>
            <span className="status-pill">bron</span>
          </div>
        ))}
      </div>

      <div className="admin-table">
        {items.length === 0 ? <p className="account-muted">Nog geen scanvoorstellen. Start een scan om de reviewlijst te vullen.</p> : null}
        {items.map((candidate) => (
          <div className="admin-report-row" key={candidate.id}>
            <span className="admin-report-main">
              <strong>{candidate.title}</strong>
              <small>
                {new Date(candidate.startAt).toLocaleString("nl-NL", { dateStyle: "medium", timeStyle: "short" })} · {candidate.locationName} · {candidate.sourceName}
              </small>
              <small>
                {candidate.organizerName} · vertrouwen {candidate.confidence}% · {candidate.status.toLowerCase()}
              </small>
              {candidate.aiNotes.length ? <p>{candidate.aiNotes.join(" · ")}</p> : null}
              {candidate.rejectionReason ? <small>Afwijzing: {candidate.rejectionReason}</small> : null}
              <a href={candidate.sourceUrl} rel="noreferrer" target="_blank">
                Bron bekijken
              </a>
            </span>
            <span className="admin-report-actions">
              <button className="admin-inline-button" disabled={candidate.status === "APPROVED"} onClick={() => reviewCandidate(candidate.id, "approve")} type="button">
                Goedkeuren
              </button>
              <button className="admin-inline-button" disabled={candidate.status === "REJECTED"} onClick={() => reviewCandidate(candidate.id, "reject")} type="button">
                Afwijzen
              </button>
            </span>
          </div>
        ))}
      </div>

      {status ? (
        <p className="account-status" role="status" aria-live="polite">
          {status}
        </p>
      ) : null}
    </div>
  );
}
