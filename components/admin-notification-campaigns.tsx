"use client";

import { useState } from "react";

type AdminNotificationCampaignsProps = {
  campaigns: Array<{
    id: string;
    title: string;
    status: string;
    businessName: string;
    deliveryCount: number;
  }>;
};

export function AdminNotificationCampaigns({ campaigns }: AdminNotificationCampaignsProps) {
  const [items, setItems] = useState(campaigns);
  const [status, setStatus] = useState("");

  async function approveCampaign(campaignId: string) {
    setStatus("Campagne goedkeuren...");
    const response = await fetch(`/api/admin/notification-campaigns/${campaignId}/approve`, {
      method: "POST",
    });
    const body = (await response.json().catch(() => null)) as { error?: string; campaign?: { status: string } } | null;

    if (!response.ok || !body?.campaign) {
      setStatus(body?.error ?? "Campagne kon niet worden goedgekeurd");
      return;
    }

    setItems((current) => current.map((item) => (item.id === campaignId ? { ...item, status: body.campaign?.status ?? item.status } : item)));
    setStatus("Campagne goedgekeurd. Verzending blijft apart gecontroleerd.");
  }

  return (
    <div className="admin-table">
      {items.length === 0 ? <p className="account-muted">Geen notificatiecampagnes.</p> : null}
      {items.map((campaign) => (
        <div className="admin-row" key={campaign.id}>
          <span>
            <strong>{campaign.title}</strong>
            <small>
              {campaign.businessName} · {campaign.deliveryCount} ontvangers
            </small>
          </span>
          <span className="business-row-actions">
            <span className="status-pill">{campaign.status}</span>
            {campaign.status === "pending" ? (
              <button className="status-pill admin-inline-button" onClick={() => approveCampaign(campaign.id)} type="button">
                Goedkeuren
              </button>
            ) : null}
          </span>
        </div>
      ))}
      {status ? <p className="small-muted">{status}</p> : null}
    </div>
  );
}
