"use client";

import { useState } from "react";

type AdminBusinessStatus = "pending" | "approved" | "suspended";

type AdminBusinessItem = {
  activityCount: number;
  id: string;
  memberCount: number;
  name: string;
  status: AdminBusinessStatus;
};

const statusLabels: Record<AdminBusinessStatus, string> = {
  approved: "goedgekeurd",
  pending: "in afwachting",
  suspended: "geschorst",
};

export function AdminBusinesses({ businesses }: { businesses: AdminBusinessItem[] }) {
  const [items, setItems] = useState(businesses);
  const [status, setStatus] = useState("");

  async function updateBusiness(businessId: string, nextStatus: AdminBusinessStatus) {
    setStatus("Bedrijf bijwerken...");
    const response = await fetch(`/api/admin/businesses/${businessId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    const body = (await response.json().catch(() => null)) as { business?: { status: string }; error?: string } | null;

    if (!response.ok || !body?.business) {
      setStatus(body?.error ?? "Bedrijf kon niet worden bijgewerkt");
      return;
    }

    setItems((current) =>
      current.map((business) =>
        business.id === businessId ? { ...business, status: body.business?.status.toLowerCase() as AdminBusinessStatus } : business,
      ),
    );
    setStatus("Bedrijfsstatus bijgewerkt en vastgelegd in de auditlog.");
  }

  return (
    <div className="admin-table">
      {items.map((business) => (
        <div className="admin-row" key={business.id}>
          <span>
            <strong>{business.name}</strong>
            <small>
              {business.memberCount} leden · {business.activityCount} activiteiten
            </small>
          </span>
          <span className="business-row-actions">
            <span className="status-pill">{statusLabels[business.status] ?? business.status}</span>
            {business.status !== "approved" ? (
              <button className="status-pill admin-inline-button" onClick={() => updateBusiness(business.id, "approved")} type="button">
                Goedkeuren
              </button>
            ) : null}
            {business.status !== "suspended" ? (
              <button className="status-pill admin-inline-button" onClick={() => updateBusiness(business.id, "suspended")} type="button">
                Schorsen
              </button>
            ) : null}
            {business.status !== "pending" ? (
              <button className="status-pill admin-inline-button" onClick={() => updateBusiness(business.id, "pending")} type="button">
                Terugzetten
              </button>
            ) : null}
          </span>
        </div>
      ))}
      {status ? <p className="small-muted">{status}</p> : null}
    </div>
  );
}
