import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminActivities } from "@/components/admin-activities";
import { AdminActivityImport } from "@/components/admin-activity-import";
import { AdminBusinesses } from "@/components/admin-businesses";
import { AdminNotificationCampaigns } from "@/components/admin-notification-campaigns";
import { AdminReports } from "@/components/admin-reports";
import { ContentMaintenancePanel } from "@/components/content-maintenance-panel";
import { requireAdmin } from "@/lib/admin-auth";
import { getAnalyticsSnapshot } from "@/lib/analytics-snapshot";
import { getBillingSummary } from "@/lib/billing-summary";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type AdminBusinessRow = {
  _count: { activities: number; members: number };
  id: string;
  name: string;
  status: string;
};

type AdminActivityRow = {
  business: { name: string } | null;
  id: string;
  organizerName: string;
  status: string;
  title: string;
};

type AdminUserRow = {
  disabledAt: Date | null;
  displayName: string | null;
  email: string;
  id: string;
  isAdmin: boolean;
};

type AdminReportRow = {
  activity: { title: string } | null;
  createdAt: Date;
  details: string | null;
  id: string;
  reason: string;
  reporter: { displayName: string | null; email: string } | null;
  resolution: string | null;
  status: string;
};

type AdminCampaignRow = {
  _count: { deliveries: number };
  business: { name: string };
  id: string;
  status: string;
  title: string;
};

type AdminFeatureFlagRow = {
  description: string | null;
  enabled: boolean;
  id: string;
  key: string;
};

type AdminAuditLogRow = {
  action: string;
  createdAt: Date;
  id: string;
  targetType: string;
};

export default async function AdminPage() {
  const admin = await requireAdmin();

  if (!admin.ok) {
    redirect(admin.status === 401 ? "/account" : "/");
  }

  const [users, businesses, activities, reports, notificationCampaigns, analytics, billing, featureFlags, auditLogs] = await Promise.all([
    prisma.user.findMany({
      select: { id: true, email: true, displayName: true, isAdmin: true, disabledAt: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.business.findMany({
      include: { _count: { select: { activities: true, members: true } } },
      orderBy: [{ status: "asc" }, { name: "asc" }],
      take: 8,
    }),
    prisma.activity.findMany({
      include: { business: true },
      orderBy: { updatedAt: "desc" },
      take: 8,
    }),
    prisma.report.findMany({
      include: {
        activity: { select: { title: true } },
        reporter: { select: { displayName: true, email: true } },
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      take: 8,
    }),
    prisma.notificationCampaign.findMany({
      include: {
        business: { select: { name: true } },
        _count: { select: { deliveries: true } },
      },
      orderBy: [{ status: "asc" }, { requestedAt: "desc" }],
      take: 8,
    }),
    getAnalyticsSnapshot(),
    getBillingSummary(),
    prisma.featureFlag.findMany({ orderBy: { key: "asc" } }),
    prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
  ]);

  return (
    <main className="account-page" id="main-content">
      <section className="account-shell admin-shell">
        <Link className="account-back" href="/">
          Terug naar agenda
        </Link>
        <p className="account-kicker">Platform admin</p>
        <h1>Beheer</h1>

        <div className="admin-grid">
          <section className="account-card">
            <h2>Bedrijven</h2>
            <AdminBusinesses
              businesses={(businesses as AdminBusinessRow[]).map((business) => ({
                activityCount: business._count.activities,
                id: business.id,
                memberCount: business._count.members,
                name: business.name,
                status: business.status.toLowerCase() as "pending" | "approved" | "suspended",
              }))}
            />
          </section>

          <section className="account-card">
            <h2>Activiteiten</h2>
            <AdminActivities
              activities={(activities as AdminActivityRow[]).map((activity) => ({
                id: activity.id,
                organizerName: activity.business?.name ?? activity.organizerName,
                status: activity.status.toLowerCase() as "draft" | "scheduled" | "published" | "unpublished" | "expired",
                title: activity.title,
              }))}
            />
          </section>

          <section className="account-card">
            <h2>Gebruikers</h2>
            <div className="admin-table">
              {(users as AdminUserRow[]).map((user) => (
                <div className="admin-row" key={user.id}>
                  <span>
                    <strong>{user.displayName ?? user.email}</strong>
                    <small>{user.email}</small>
                  </span>
                  <span className="status-pill">{user.disabledAt ? "uitgeschakeld" : user.isAdmin ? "admin" : "actief"}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="account-card">
            <h2>Meldingen</h2>
            <AdminReports
              reports={(reports as AdminReportRow[]).map((report) => ({
                id: report.id,
                activityTitle: report.activity?.title ?? "Algemeen",
                createdAt: report.createdAt.toLocaleDateString("nl-NL"),
                details: report.details,
                reason: report.reason,
                reporterLabel: report.reporter?.displayName ?? report.reporter?.email ?? "Anoniem",
                resolution: report.resolution,
                status: report.status.toLowerCase() as "open" | "reviewed" | "dismissed",
              }))}
            />
          </section>

          <section className="account-card">
            <h2>Notificatiecampagnes</h2>
            <AdminNotificationCampaigns
              campaigns={(notificationCampaigns as AdminCampaignRow[]).map((campaign) => ({
                id: campaign.id,
                title: campaign.title,
                status: campaign.status.toLowerCase(),
                businessName: campaign.business.name,
                deliveryCount: campaign._count.deliveries,
              }))}
            />
          </section>

          <section className="account-card">
            <h2>Analytics</h2>
            <div className="analytics-metric-grid">
              <span>
                <strong>{analytics.activityViews}</strong>
                <small>kaartviews</small>
              </span>
              <span>
                <strong>{analytics.sourceClicks}</strong>
                <small>bronkliks</small>
              </span>
              <span>
                <strong>{analytics.filterUses}</strong>
                <small>filters</small>
              </span>
              <span>
                <strong>{analytics.attendanceClicks}</strong>
                <small>ik-ga kliks</small>
              </span>
              <span>
                <strong>{analytics.calendarExports}</strong>
                <small>agenda exports totaal</small>
              </span>
              <span>
                <strong>{analytics.notificationOptIns}</strong>
                <small>notificatie opt-ins</small>
              </span>
              <span>
                <strong>{analytics.aiUsageCount}</strong>
                <small>AI-aanvragen</small>
              </span>
            </div>
            {analytics.calendarExportBreakdown.length ? (
              <p className="small-muted">
                Agenda export verdeling:{" "}
                {analytics.calendarExportBreakdown
                  .map((item) => `${item.kind.replaceAll("_", " ")} ${item.count}`)
                  .join(", ")}
              </p>
            ) : null}
            <p className="small-muted">Laatste {analytics.windowDays} dagen. Geen cookies of persoonlijke browseprofielen.</p>
          </section>

          <section className="account-card">
            <h2>Billing</h2>
            <div className="analytics-metric-grid">
              <span>
                <strong>{billing.customers}</strong>
                <small>klanten</small>
              </span>
              <span>
                <strong>{billing.activeSubscriptions}</strong>
                <small>actieve pakketten</small>
              </span>
              <span>
                <strong>{billing.openTransactions}</strong>
                <small>open transacties</small>
              </span>
              <span>
                <strong>€{(billing.paidAmountCents / 100).toFixed(0)}</strong>
                <small>betaald totaal</small>
              </span>
              <span>
                <strong>{billing.webhookEvents}</strong>
                <small>webhook events</small>
              </span>
              <span>
                <strong>Mollie</strong>
                <small>voorkeurprovider</small>
              </span>
            </div>
            <p className="small-muted">Billing is foundation-only. Live betalingen zijn geen MVP-vereiste.</p>
          </section>

          <section className="account-card">
            <h2>Feature flags</h2>
            <div className="admin-table">
              {(featureFlags as AdminFeatureFlagRow[]).map((flag) => (
                <div className="admin-row" key={flag.id}>
                  <span>
                    <strong>{flag.key}</strong>
                    <small>{flag.description ?? "Geen beschrijving"}</small>
                  </span>
                  <span className="status-pill">{flag.enabled ? "aan" : "uit"}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="account-card">
            <h2>Audit logs</h2>
            <div className="admin-table">
              {(auditLogs as AdminAuditLogRow[]).map((log) => (
                <div className="admin-row" key={log.id}>
                  <span>
                    <strong>{log.action}</strong>
                    <small>{log.targetType}</small>
                  </span>
                  <span className="status-pill">{log.createdAt.toLocaleDateString("nl-NL")}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="account-card">
            <h2>Import preview</h2>
            <p className="account-muted">Plak activiteiten als tabel; import blijft review-first en schrijft niet direct naar de database.</p>
            <AdminActivityImport />
          </section>

          <section className="account-card">
            <h2>Content onderhoud</h2>
            <ContentMaintenancePanel />
          </section>
        </div>
      </section>
    </main>
  );
}
