import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminNotificationCampaigns } from "@/components/admin-notification-campaigns";
import { requireAdmin } from "@/lib/admin-auth";
import { getAnalyticsSnapshot } from "@/lib/analytics-snapshot";
import { getBillingSummary } from "@/lib/billing-summary";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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
      include: { activity: { select: { title: true } } },
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
            <div className="admin-table">
              {businesses.map((business) => (
                <div className="admin-row" key={business.id}>
                  <span>
                    <strong>{business.name}</strong>
                    <small>
                      {business._count.members} leden · {business._count.activities} activiteiten
                    </small>
                  </span>
                  <span className="status-pill">{business.status.toLowerCase()}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="account-card">
            <h2>Activiteiten</h2>
            <div className="admin-table">
              {activities.map((activity) => (
                <div className="admin-row" key={activity.id}>
                  <span>
                    <strong>{activity.title}</strong>
                    <small>{activity.business?.name ?? activity.organizerName}</small>
                  </span>
                  <span className="status-pill">{activity.status.toLowerCase()}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="account-card">
            <h2>Gebruikers</h2>
            <div className="admin-table">
              {users.map((user) => (
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
            <div className="admin-table">
              {reports.length === 0 ? <p className="account-muted">Geen meldingen.</p> : null}
              {reports.map((report) => (
                <div className="admin-row" key={report.id}>
                  <span>
                    <strong>{report.reason}</strong>
                    <small>{report.activity?.title ?? "Algemeen"}</small>
                  </span>
                  <span className="status-pill">{report.status.toLowerCase()}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="account-card">
            <h2>Notificatiecampagnes</h2>
            <AdminNotificationCampaigns
              campaigns={notificationCampaigns.map((campaign) => ({
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
                <strong>{analytics.notificationOptIns}</strong>
                <small>notificatie opt-ins</small>
              </span>
              <span>
                <strong>{analytics.aiUsageCount}</strong>
                <small>AI-aanvragen</small>
              </span>
            </div>
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
              {featureFlags.map((flag) => (
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
              {auditLogs.map((log) => (
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
        </div>
      </section>
    </main>
  );
}
