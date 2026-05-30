"use client";

import { useState, type FormEvent } from "react";

type ScannerCandidate = {
  aiNotes: string[];
  confidence: number;
  duplicateReason: string | null;
  duplicateScore: number;
  id: string;
  locationName: string;
  organizerName: string;
  qualityReasons: string[];
  qualityScore: number;
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

type ScannerOperations = {
  checklist: Array<{ done: boolean; label: string }>;
  dueSourceCount: number;
  failedSourceCount: number;
  failedSources: Array<{ error: string | null; id: string; name: string; startedAt: string }>;
  lastCompletedRunAt: string | null;
  nextWeeklyScanAt: string | null;
  pendingReviewCount: number;
  runStatusCounts: Array<{ count: number; status: string }>;
  staleSources: Array<{ id: string; lastScannedAt: string | null; name: string }>;
};

type ScannerPrompt = {
  prompt: string;
  providerName: string;
  title: string;
  updatedAt: string;
  version: number;
};

type AdminAiActivityScannerProps = {
  candidates: ScannerCandidate[];
  operations: ScannerOperations;
  prompt: ScannerPrompt;
  sources: ScannerSource[];
};

export function AdminAiActivityScanner({ candidates, operations, prompt, sources }: AdminAiActivityScannerProps) {
  const [items, setItems] = useState(candidates);
  const [sourceItems, setSourceItems] = useState(sources);
  const [newSourceName, setNewSourceName] = useState("");
  const [newSourceUrl, setNewSourceUrl] = useState("");
  const [newSourceKind, setNewSourceKind] = useState("WEBSITE");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [scannerPrompt, setScannerPrompt] = useState(prompt.prompt);
  const [promptUpdatedAt, setPromptUpdatedAt] = useState(prompt.updatedAt);
  const [status, setStatus] = useState("");
  const pendingCount = items.filter((item) => item.status === "PENDING" || item.status === "NEEDS_REVIEW").length;
  const rejectedCount = items.filter((item) => item.status === "REJECTED").length;


  async function savePrompt() {
    setStatus("Scanprompt opslaan...");
    const response = await fetch("/api/admin/activity-scanner/prompt", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: scannerPrompt }),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus(body?.error ?? "Scanprompt kon niet worden opgeslagen");
      return;
    }

    const body = (await response.json()) as { prompt: { prompt: string; updatedAt: string } };
    setScannerPrompt(body.prompt.prompt);
    setPromptUpdatedAt(body.prompt.updatedAt);
    setStatus("Scanprompt opgeslagen");
  }

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

  async function runScan(mode: "all" | "failed" = "all") {
    setStatus(mode === "failed" ? "Mislukte bronnen opnieuw scannen..." : "Scan wordt gestart...");
    const response = await fetch("/api/admin/activity-scanner/scan-runs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: mode === "failed" ? "failed" : "all" }),
    });

    if (!response.ok) {
      setStatus("Scan kon niet worden gestart");
      return;
    }

    const body = (await response.json().catch(() => null)) as { message?: string } | null;
    setStatus(body?.message ?? "Scan afgerond. Ververs de pagina om nieuwe voorstellen te zien.");
  }

  function toggleCandidate(candidateId: string) {
    setSelectedIds((current) => (current.includes(candidateId) ? current.filter((id) => id !== candidateId) : [...current, candidateId]));
  }

  async function bulkReview(action: "approve" | "reject") {
    if (selectedIds.length === 0) {
      setStatus("Selecteer eerst voorstellen");
      return;
    }

    const reason = action === "reject" ? window.prompt("Waarom wijs je deze voorstellen af?", "Bulk afgewezen door admin") ?? "" : "";
    setStatus(action === "approve" ? "Voorstellen goedkeuren..." : "Voorstellen afwijzen...");
    const response = await fetch("/api/admin/activity-scanner/candidates/bulk", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, candidateIds: selectedIds, reason }),
    });

    if (!response.ok) {
      setStatus("Bulkactie kon niet worden verwerkt");
      return;
    }

    setItems((current) => current.map((item) => (selectedIds.includes(item.id) ? { ...item, status: action === "approve" ? "APPROVED" : "REJECTED", rejectionReason: reason } : item)));
    setSelectedIds([]);
    setStatus(action === "approve" ? "Voorstellen gepubliceerd" : "Voorstellen afgewezen");
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
        <button className="primary-button" onClick={() => runScan()} type="button">
          Scan voor nieuwe activiteiten
        </button>
        <span className="status-pill">{pendingCount} te beoordelen</span>
        <span className="status-pill">{rejectedCount} afgewezen</span>
        <button className="outline-button" disabled={operations.failedSourceCount === 0} onClick={() => runScan("failed")} type="button">Mislukte bronnen opnieuw</button>
        <button className="outline-button" onClick={() => bulkReview("approve")} type="button">Selectie goedkeuren</button>
        <button className="outline-button" onClick={() => bulkReview("reject")} type="button">Selectie afwijzen</button>
      </div>


      <div className="admin-table">
        <div className="analytics-metric-grid">
          <span>
            <strong>{operations.dueSourceCount}</strong>
            <small>bronnen toe aan weekscan</small>
          </span>
          <span>
            <strong>{operations.pendingReviewCount}</strong>
            <small>voorstellen in review</small>
          </span>
          <span>
            <strong>{operations.failedSourceCount}</strong>
            <small>mislukte bronnen</small>
          </span>
          <span>
            <strong>{operations.nextWeeklyScanAt ? new Date(operations.nextWeeklyScanAt).toLocaleDateString("nl-NL") : "Nog plannen"}</strong>
            <small>volgende weekronde</small>
          </span>
        </div>
        <div className="admin-row">
          <span>
            <strong>Weekchecklist</strong>
            <small>{operations.checklist.map((item) => `${item.done ? "klaar" : "open"}: ${item.label}`).join(" · ")}</small>
          </span>
          <span className="status-pill">{operations.lastCompletedRunAt ? `laatste scan ${new Date(operations.lastCompletedRunAt).toLocaleDateString("nl-NL")}` : "nog geen scan"}</span>
        </div>
        {operations.staleSources.length ? (
          <p className="small-muted">Weekscan nodig voor: {operations.staleSources.map((source) => source.name).join(", ")}</p>
        ) : null}
        {operations.failedSources.length ? (
          <p className="small-muted">Mislukt: {operations.failedSources.map((source) => `${source.name}${source.error ? ` (${source.error})` : ""}`).join(", ")}</p>
        ) : null}
        {operations.runStatusCounts.length ? (
          <p className="small-muted">Scanruns: {operations.runStatusCounts.map((row) => `${row.status.toLowerCase()} ${row.count}`).join(", ")}</p>
        ) : null}
      </div>


      <div className="admin-table">
        <div className="admin-row">
          <span>
            <strong>{prompt.title}</strong>
            <small>Provider: {prompt.providerName} · versie {prompt.version} · laatst bijgewerkt {new Date(promptUpdatedAt).toLocaleString("nl-NL")}</small>
          </span>
          <button className="admin-inline-button" onClick={savePrompt} type="button">Prompt opslaan</button>
        </div>
        <label className="account-form">
          Scanprompt
          <textarea maxLength={6000} onChange={(event) => setScannerPrompt(event.target.value)} rows={10} value={scannerPrompt} />
        </label>
        <p className="small-muted">Deze prompt wordt gebruikt door OpenAI of Claude/Anthropic wanneer `AI_ACTIVITY_PROVIDER` op `openai`, `anthropic` of `claude` staat. Zonder provider blijft de lokale extractor actief.</p>
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
              <label className="account-check">
                <input checked={selectedIds.includes(candidate.id)} onChange={() => toggleCandidate(candidate.id)} type="checkbox" />
                <strong>{candidate.title}</strong>
              </label>
              <small>
                {new Date(candidate.startAt).toLocaleString("nl-NL", { dateStyle: "medium", timeStyle: "short" })} · {candidate.locationName} · {candidate.sourceName}
              </small>
              <small>
                {candidate.organizerName} · vertrouwen {candidate.confidence}% · kwaliteit {candidate.qualityScore}% · dubbel {candidate.duplicateScore}% · {candidate.status.toLowerCase()}
              </small>
              {candidate.duplicateReason ? <small>Dubbelcheck: {candidate.duplicateReason}</small> : null}
              {candidate.qualityReasons.length ? <small>Kwaliteit: {candidate.qualityReasons.join(" · ")}</small> : null}
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
