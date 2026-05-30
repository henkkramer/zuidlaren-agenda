import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminActivities } from "@/components/admin-activities";
import { AdminAiActivityScanner } from "@/components/admin-ai-activity-scanner";
import { AdminActivityImport } from "@/components/admin-activity-import";
import { AdminBusinesses } from "@/components/admin-businesses";
import { AdminNotificationCampaigns } from "@/components/admin-notification-campaigns";
import { AdminReports } from "@/components/admin-reports";
import { ContentMaintenancePanel } from "@/components/content-maintenance-panel";
import { requireAdmin } from "@/lib/admin-auth";
import { getActivityScannerOperations } from "@/lib/ai-activity-operations";
import { getActivityExtractionProvider } from "@/lib/ai-activity-extraction";
import { defaultActivityScannerPrompt, getActivityScannerPromptTemplate } from "@/lib/ai-activity-prompt";
import { getAnalyticsSnapshot } from "@/lib/analytics-snapshot";
import { getBillingSummary } from "@/lib/billing-summary";
import { prisma } from "@/lib/prisma";
import { adminActivityListSelect } from "@/lib/prisma-selects";
import { logWarn } from "@/lib/structured-log";

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

type AdminScannerSourceRow = {
  baseUrl: string;
  enabled: boolean;
  id: string;
  kind: string;
  lastScannedAt: Date | null;
  name: string;
  respectRobots: boolean;
};


type AdminScannerDashboard = {
  candidates: AdminScannerCandidateRow[];
  operations: Awaited<ReturnType<typeof getActivityScannerOperations>>;
  promptTemplate: { prompt: string; title: string; updatedAt: Date; version: number };
  sources: AdminScannerSourceRow[];
  unavailableReason: string | null;
};

function fallbackScannerOperations(): Awaited<ReturnType<typeof getActivityScannerOperations>> {
  return {
    checklist: [
      { done: false, label: "Scannerdata niet beschikbaar" },
      { done: false, label: "Controleer database schema/deploy" },
    ],
    dueSourceCount: 0,
    failedSourceCount: 0,
    failedSources: [],
    lastCompletedRunAt: null,
    nextWeeklyScanAt: null,
    pendingReviewCount: 0,
    runStatusCounts: [],
    staleSources: [],
  };
}

async function getAdminScannerDashboard(): Promise<AdminScannerDashboard> {
  try {
    const [sources, candidates, operations, promptTemplate] = await Promise.all([
      prisma.activityScanSource.findMany({
        select: { id: true, baseUrl: true, name: true, kind: true, enabled: true, respectRobots: true, lastScannedAt: true },
        orderBy: [{ enabled: "desc" }, { name: "asc" }],
        take: 8,
      }),
      prisma.activityScanCandidate.findMany({
        include: { source: { select: { name: true } } },
        orderBy: [{ status: "asc" }, { startAt: "asc" }],
        take: 20,
      }),
      getActivityScannerOperations(),
      getActivityScannerPromptTemplate(),
    ]);

    return { candidates: candidates as AdminScannerCandidateRow[], operations, promptTemplate, sources: sources as AdminScannerSourceRow[], unavailableReason: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI scanner kon niet worden geladen";
    logWarn("admin.activity_scanner.unavailable", { error: message });
    return {
      candidates: [],
      operations: fallbackScannerOperations(),
      promptTemplate: { prompt: defaultActivityScannerPrompt, title: "AI activiteitenscan extractie", updatedAt: new Date(0), version: 1 },
      sources: [],
      unavailableReason: "AI scanner is tijdelijk niet beschikbaar. Controleer of de database is bijgewerkt met het laatste schema.",
    };
  }
}

type AdminScannerCandidateRow = {
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
  source: { name: string };
  sourceUrl: string;
  startAt: Date;
  status: string;
  title: string;
};

export default async function AdminPage() {
  const admin = await requireAdmin();

  if (!admin.ok) {
    redirect("/admin/login");
  }

  const [
    users,
    businesses,
    activities,
    reports,
    notificationCampaigns,
    analytics,
    billing,
    featureFlags,
    auditLogs,
    scannerDashboard,
  ] = await Promise.all([
    prisma.user.findMany({
      select: { id: true, email: true, displayName: true, isAdmin: true, disabledAt: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.business.findMany({
      select: { id: true, name: true, status: true, _count: { select: { activities: true, members: true } } },
      orderBy: [{ status: "asc" }, { name: "asc" }],
      take: 8,
    }),
    prisma.activity.findMany({
      select: adminActivityListSelect,
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
    prisma.featureFlag.findMany({
      select: { id: true, key: true, enabled: true, description: true },
      orderBy: { key: "asc" },
    }),
    prisma.auditLog.findMany({
      select: { id: true, action: true, targetType: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    getAdminScannerDashboard(),
  ]);

  const scannerProvider = getActivityExtractionProvider();

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
                <strong>{analytics.publicActivityLists}</strong>
                <small>lijst API</small>
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
                <strong>{analytics.webVitals}</strong>
                <small>Web Vitals</small>
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
            {analytics.webVitalBreakdown.length ? (
              <p className="small-muted">
                Web Vitals:{" "}
                {analytics.webVitalBreakdown
                  .map((item) => item.kind.replaceAll("_", " ") + " " + item.count)
                  .join(", ")}
              </p>
            ) : null}
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
            <h2>AI activiteitenscan</h2>
            <p className="account-muted">Scan goedgekeurde openbare bronnen en beoordeel voorstellen voordat ze in de agenda komen.</p>
            <AdminAiActivityScanner
              operations={scannerDashboard.operations}
              scannerUnavailableReason={scannerDashboard.unavailableReason}
              prompt={{
                prompt: scannerDashboard.promptTemplate.prompt,
                providerName: scannerProvider.name,
                title: scannerDashboard.promptTemplate.title,
                updatedAt: scannerDashboard.promptTemplate.updatedAt.toISOString(),
                version: scannerDashboard.promptTemplate.version,
              }}
              sources={scannerDashboard.sources.map((source) => ({
                baseUrl: source.baseUrl,
                enabled: source.enabled,
                id: source.id,
                kind: source.kind,
                lastScannedAt: source.lastScannedAt?.toISOString() ?? null,
                name: source.name,
                respectRobots: source.respectRobots,
              }))}
              candidates={scannerDashboard.candidates.map((candidate) => ({
                aiNotes: candidate.aiNotes,
                confidence: candidate.confidence,
                duplicateReason: candidate.duplicateReason,
                duplicateScore: candidate.duplicateScore,
                id: candidate.id,
                locationName: candidate.locationName,
                organizerName: candidate.organizerName,
                qualityReasons: candidate.qualityReasons,
                qualityScore: candidate.qualityScore,
                rejectionReason: candidate.rejectionReason,
                sourceName: candidate.source.name,
                sourceUrl: candidate.sourceUrl,
                startAt: candidate.startAt.toISOString(),
                status: candidate.status as "PENDING" | "APPROVED" | "REJECTED" | "DUPLICATE" | "NEEDS_REVIEW",
                title: candidate.title,
              }))}
            />
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
