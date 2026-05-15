"use client";

import { useMemo, useState } from "react";
import { parseActivityImportPreview } from "@/lib/admin-activity-import";

const exampleRows = [
  "title;startAt;endAt;locationName;shortDescription;description;sourceUrl;category;typeTags;organizerName",
  "Voorbeeldactiviteit;2026-06-04T19:30:00;2026-06-04T21:30:00;Brink Zuidlaren;Korte omschrijving;Lange beschrijving;https://naarzuidlaren.nl/;cultuur;Muziek,Gratis;Organisator",
].join("\n");

export function AdminActivityImport() {
  const [input, setInput] = useState(exampleRows);
  const rows = useMemo(() => parseActivityImportPreview(input), [input]);
  const validCount = rows.filter((row) => row.status === "draft").length;
  const invalidCount = rows.filter((row) => row.status === "invalid").length;

  return (
    <div className="admin-import-panel">
      <textarea aria-label="Activiteiten importeren" onChange={(event) => setInput(event.target.value)} rows={7} value={input} />
      <div className="admin-import-summary">
        <span className="status-pill">{validCount} concepten</span>
        <span className="status-pill">{invalidCount} fouten</span>
      </div>
      <div className="admin-table">
        {rows.length === 0 ? <p className="account-muted">Plak een kopregel en minimaal een activiteitregel.</p> : null}
        {rows.map((row) => (
          <div className="admin-row" key={`${row.rowNumber}-${row.title}`}>
            <span>
              <strong>{row.title}</strong>
              <small>
                Rij {row.rowNumber} · {row.status === "draft" ? "klaar voor handmatige controle" : row.errors.join(", ")}
              </small>
              {row.warnings.length > 0 ? <small>{row.warnings.join(" · ")}</small> : null}
            </span>
            <span className="status-pill">{row.status === "draft" ? "concept" : "fout"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
