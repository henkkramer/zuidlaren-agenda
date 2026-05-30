"use client";

import { useState, type FormEvent } from "react";

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
  baseUrl: string;
  enabled: boolean;
  id: string;
  kind: string;
  lastScannedAt: string | null;
  name: string;
  respectRobots: boolean;
};

type AdminAiActivityScannerProps = {
  candidates: ScannerCandidate[];
  sources: ScannerSource[];
};

export function AdminAiActivityScanner({ candidates, sources }: AdminAiActivityScannerProps) {
  const [items, setItems] = useState(candidates);
  const [sourceItems, setSourceItems] = useState(sources);
  const [newSourceName, setNewSourceName] = useState("");
  const [newSourceUrl, setNewSourceUrl] = useState("");
  const [newSourceKind, setNewSourceKind] = useState("WEBSITE");
  const [status, setStatus] = useState("");
  const pendingCount = items.filter((item) => item.status === "PENDING" || item.status === "NEEDS_REVIEW").length;
  const rejectedCount = items.filter((item) => item.status === "REJECTED").length;

  async function createSource(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Bron opslaan...");

    const response = await fetch("/api/admin/activity-scanner/sources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ baseUrl: newSourceUrl, kind: newSourceKind, name: newSourceName, respectRobots: true }),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus(body?.error ?? "Bron kon niet worden opgeslagen");
      return;
    }

    const body = (await response.json()) as { source: ScannerSource };
    setSourceItems((current) => [...current, { ...body.source, lastScannedAt: body.source.lastScannedAt ?? null }]);
    setNewSourceName("");
    setNewSourceUrl("");
    setNewSourceKind("WEBSITE");
    setStatus("Bron toegevoegd");
  }

  async function toggleSource(source: ScannerSource) {
    setStatus("Bron bijwerken...");
    const response = await fetch(`/api/admin/activity-scanner/sources/${source.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...source, enabled: !source.enabled }),
    });

    if (!response.ok) {
      setStatus("Bron kon niet worden bijgewerkt");
      return;
    }

    const body = (await response.json()) as { source: ScannerSource };
    setSourceItems((current) => current.map((item) => (item.id === source.id ? { ...item, ...body.source } : item)));
    setStatus(body.source.enabled ? "Bron geactiveerd" : "Bron uitgezet");
  }

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
        <form className="account-form" onSubmit={createSource}>
          <label>
            Bronnaam
            <input maxLength={120} onChange={(event) => setNewSourceName(event.target.value)} placeholder="Gemeente Tynaarlo agenda" required value={newSourceName} />
          </label>
          <label>
            Publieke URL
            <input onChange={(event) => setNewSourceUrl(event.target.value)} placeholder="https://example.nl/agenda" required type="url" value={newSourceUrl} />
          </label>
          <label>
            Type
            <select onChange={(event) => setNewSourceKind(event.target.value)} value={newSourceKind}>
              <option value="WEBSITE">Website</option>
              <option value="GOVERNMENT">Gemeente</option>
              <option value="SOCIAL">Publieke social</option>
              <option value="RESTAURANT">Restaurant</option>
              <option value="BAR">Bar</option>
              <option value="OTHER">Overig</option>
            </select>
          </label>
          <button className="outline-button" type="submit">Bron toevoegen</button>
        </form>
        {sourceItems.map((source) => (
          <div className="admin-row" key={source.id}>
            <span>
              <strong>{source.name}</strong>
              <small>
                {source.kind.toLowerCase()} · {source.enabled ? "actief" : "uit"} · robots {source.respectRobots ? "respecteren" : "uit"} · laatst gescand {source.lastScannedAt ? new Date(source.lastScannedAt).toLocaleDateString("nl-NL") : "nog niet"}
              </small>
              <small>{source.baseUrl}</small>
            </span>
            <button className="admin-inline-button" onClick={() => toggleSource(source)} type="button">
              {source.enabled ? "Uitzetten" : "Activeren"}
            </button>
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
