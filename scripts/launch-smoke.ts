import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { buildMobileCapabilities } from "@/lib/mobile-contracts";
import { publicApiGovernanceRequiredChecks, publicApiGovernanceRequiredDocs } from "@/lib/public-api-governance";

const root = process.cwd();

function assert(condition: unknown, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertFile(path: string) {
  assert(existsSync(join(root, path)), `Missing required launch file: ${path}`);
}

function read(path: string) {
  return readFileSync(join(root, path), "utf8");
}

const requiredFiles = [
  "app/page.tsx",
  "app/privacy/page.tsx",
  "app/voorwaarden/page.tsx",
  "app/error.tsx",
  "app/not-found.tsx",
  "app/api/health/route.ts",
  "app/api/health/ready/route.ts",
  "app/api/health/release/route.ts",
  "app/api/public/calendar/route.ts",
  "app/api/public/activities/route.ts",
  "app/api/public/activities/[activityId]/calendar/route.ts",
  "app/api/me/agenda/calendar/route.ts",
  "app/api/reports/route.ts",
  "app/api/mobile/capabilities/route.ts",
  "lib/csrf.ts",
  "lib/admin-status-input.ts",
  "lib/audit-actions.ts",
  "lib/media-validation.ts",
  "lib/notification-preferences-input.ts",
  "lib/notification-campaign-input.ts",
  "lib/notification-delivery.ts",
  "lib/payment-webhooks.ts",
  "lib/profile-input.ts",
  "lib/privacy-processors.ts",
  "lib/report-input.ts",
  "lib/security-headers.ts",
  "lib/release-checks.ts",
  "lib/admin-activity-import.ts",
  "lib/content-maintenance-queue.ts",
  "lib/calendar-feed.ts",
  "lib/calendar-export.ts",
  "lib/analytics-breakdown.ts",
  "lib/public-activity-pagination.ts",
  "lib/public-api-governance.ts",
  ".github/workflows/ci.yml",
  "docs/ci-release-gate.md",
  "docs/audit-log-coverage.md",
  "docs/mvp-launch-readiness.md",
  "docs/mobile-api-readiness.md",
  "docs/calendar-feeds.md",
  "docs/calendar-abuse-response.md",
  "docs/calendar-client-troubleshooting.md",
  "docs/calendar-documentation-archive-review.md",
  "docs/calendar-documentation-map.md",
  "docs/calendar-maintenance-checklist.md",
  "docs/calendar-metrics.md",
  "docs/calendar-runbook-drill.md",
  "docs/calendar-support-faq.md",
  "docs/operator-handoff.md",
  "docs/pr-release-handoff.md",
  "docs/public-api-changelog.md",
  "docs/public-api-docs-index.md",
  "docs/public-api-governance-review.md",
  "docs/public-api-release-notes.md",
  "scripts/ensure-admin.ts",
  "scripts/release-check.ts",
  ".env.example",
  "docker-compose.yml",
];

for (const file of requiredFiles) {
  assertFile(file);
}

const packageJson = JSON.parse(read("package.json")) as { scripts: Record<string, string> };
const requiredScripts = ["lint", "typecheck", "test", "test:e2e", "build", "dev:3088", "start:3088", "health", "release:check", "admin:ensure", "db:seed", "seed:credentials"];

for (const script of requiredScripts) {
  assert(packageJson.scripts[script], `Missing package script: ${script}`);
}
assert(packageJson.scripts.typecheck.includes("prisma generate"), "typecheck must generate Prisma Client before tsc");

const envExample = read(".env.example");
for (const key of ["DATABASE_URL", "NEXTAUTH_URL", "NEXTAUTH_SECRET", "EMAIL_SERVER", "EMAIL_FROM", "ADMIN_EMAIL", "RELEASE_BASE_URL", "PORT=3088"]) {
  assert(envExample.includes(key), `.env.example is missing ${key}`);
}

const dockerCompose = read("docker-compose.yml");
assert(dockerCompose.includes('cpuset: "0-1"'), 'docker-compose.yml must pin the web service with cpuset: "0-1"');
const dockerfile = read("Dockerfile");
assert(dockerfile.includes("node:24-alpine@sha256:"), "Dockerfile must pin the Node base image by digest");
assert(dockerfile.includes("npm ci --omit=dev"), "Dockerfile runtime dependencies must omit dev packages");
assert(dockerfile.includes("scripts/seed-credentials.mjs"), "Dockerfile must copy the production credential seed script into the runtime image");
assert(dockerfile.includes("COPY --from=runtime-deps") && dockerfile.includes("/app/node_modules ./node_modules"), "Dockerfile must copy production node_modules for runtime maintenance scripts");

const nextConfig = read("next.config.ts");
assert(nextConfig.includes("securityHeadersForNext"), "next.config.ts must apply shared security headers");
assert(nextConfig.includes("optimizePackageImports"), "next.config.ts must optimize package imports");
assert(nextConfig.includes("/uploads/:path*"), "next.config.ts must add immutable upload cache headers");

const profileRoute = read("app/api/me/profile/route.ts");
assert(profileRoute.includes("rejectCrossOriginMutation"), "profile mutation route must apply CSRF origin guard");
assert(profileRoute.includes("parseProfileInput"), "profile mutation route must use shared profile input parsing");

const notificationPreferencesRoute = read("app/api/me/notification-preferences/route.ts");
assert(
  notificationPreferencesRoute.includes("parseNotificationPreferencesInput"),
  "notification preferences route must use shared input parsing",
);

const businessActivityRoute = read("app/api/businesses/[businessId]/activities/route.ts");
assert(businessActivityRoute.includes("rejectCrossOriginMutation"), "business activity mutation route must apply CSRF origin guard");

const notificationCampaignRoute = read("app/api/businesses/[businessId]/notification-campaigns/route.ts");
assert(
  notificationCampaignRoute.includes("parseNotificationCampaignInput"),
  "notification campaign route must use shared campaign input parsing",
);

const notificationApprovalRoute = read("app/api/admin/notification-campaigns/[campaignId]/approve/route.ts");
assert(notificationApprovalRoute.includes("buildCampaignEmailMessage"), "notification approval route must build campaign email messages");
assert(notificationApprovalRoute.includes('status: "SENT"'), "notification approval route must mark successful deliveries as sent");

const adminUserRoute = read("app/api/admin/users/[userId]/route.ts");
assert(adminUserRoute.includes("rejectCrossOriginMutation"), "admin user mutation route must apply CSRF origin guard");

const adminActivityRoute = read("app/api/admin/activities/[activityId]/route.ts");
assert(adminActivityRoute.includes("parseAdminActivityStatus"), "admin activity route must use shared status parsing");

const adminBusinesses = read("components/admin-businesses.tsx");
assert(adminBusinesses.includes("/api/admin/businesses/"), "admin businesses UI must use the admin business moderation endpoint");
for (const status of ["approved", "suspended", "pending"]) {
  assert(adminBusinesses.includes(status), `admin businesses UI must expose ${status} handling`);
}

const adminActivities = read("components/admin-activities.tsx");
assert(adminActivities.includes("/api/admin/activities/"), "admin activities UI must use the admin activity moderation endpoint");
for (const status of ["published", "unpublished", "expired"]) {
  assert(adminActivities.includes(status), `admin activities UI must expose ${status} handling`);
}

const adminActivityImport = read("components/admin-activity-import.tsx");
assert(adminActivityImport.includes("parseActivityImportPreview"), "admin import UI must use shared import preview parsing");

const aiActivityScannerRules = read("lib/ai-activity-scanner-rules.ts");
const aiActivityScannerReview = read("lib/ai-activity-scanner-review.ts");
const adminAiScanner = read("components/admin-ai-activity-scanner.tsx");
const scannerRunRoute = read("app/api/admin/activity-scanner/scan-runs/route.ts");
const scannerCandidateRoute = read("app/api/admin/activity-scanner/candidates/[candidateId]/route.ts");
const aiScannerPlan = read("implementation-plan/23-ai-activity-scanner.md");
assert(aiActivityScannerRules.includes("local-open-source-fixtures"), "AI activity scanner must start with a deterministic local provider");
assert(aiActivityScannerRules.includes("privateEventFilter"), "AI scanner fixtures must represent private-event filtering intent");
assert(aiActivityScannerReview.includes("admin.activity_scan_candidate.approve"), "AI scanner approvals must be audited");
assert(aiActivityScannerReview.includes("revalidatePublicActivityCaches"), "AI scanner approvals must invalidate public activity caches");
assert(adminAiScanner.includes("Scan voor nieuwe activiteiten"), "Admin UI must expose a scan action");
assert(adminAiScanner.includes("Goedkeuren") && adminAiScanner.includes("Afwijzen"), "Admin UI must expose approve and reject actions");
const scannerSourcesRoute = read("app/api/admin/activity-scanner/sources/route.ts");
const scannerSourceRoute = read("app/api/admin/activity-scanner/sources/[sourceId]/route.ts");
const sourceInput = read("lib/ai-activity-source-input.ts");
const sourceFetcher = read("lib/ai-activity-source-fetcher.ts");
const activityExtraction = read("lib/ai-activity-extraction.ts");
const activityQuality = read("lib/ai-activity-quality.ts");
const scannerBulkRoute = read("app/api/admin/activity-scanner/candidates/bulk/route.ts");
assert(scannerRunRoute.includes("runLocalActivityScan"), "Scanner run route must invoke the scanner provider");
assert(scannerCandidateRoute.includes("approveScanCandidate") && scannerCandidateRoute.includes("rejectScanCandidate"), "Scanner candidate route must support approval and rejection");
assert(scannerSourcesRoute.includes("parseActivityScanSourceInput"), "Scanner sources route must validate source input");
assert(scannerSourceRoute.includes("admin.activity_scan_source.update"), "Scanner source updates must be audited");
assert(sourceInput.includes("http:") && sourceInput.includes("https:"), "Scanner source input must only accept HTTP(S) URLs");
assert(sourceFetcher.includes("maxFetchBytes") && sourceFetcher.includes("fetchTimeoutMs"), "Scanner source fetcher must enforce size and timeout limits");
assert(sourceFetcher.includes("127.0.0.1") && sourceFetcher.includes(".internal"), "Scanner source fetcher must block local/internal URLs");
assert(sourceFetcher.includes("textSample"), "Scanner source fetcher must return bounded text samples for extraction");
assert(activityExtraction.includes("ActivityExtractionProvider"), "AI scanner extraction must use a provider abstraction");
assert(activityExtraction.includes("validateExtractedCandidate"), "AI scanner extraction must validate strict structured candidates");
assert(activityExtraction.includes("shouldRejectPrivateOrVagueCandidate"), "AI scanner extraction must filter private events");
assert(activityExtraction.includes("evidenceSnippets"), "AI scanner extraction must store evidence snippets instead of full pages");
assert(activityQuality.includes("scoreCandidateQuality"), "AI scanner must score candidate quality and duplicates");
assert(activityQuality.includes("titleSimilarity"), "AI scanner duplicate matching must compare event titles");
assert(adminAiScanner.includes("Selectie goedkeuren") && adminAiScanner.includes("Selectie afwijzen"), "Admin scanner UI must expose bulk review actions");
assert(scannerBulkRoute.includes("candidateIds") && scannerBulkRoute.includes("approveScanCandidate"), "AI scanner bulk route must process selected candidates through review services");
assert(aiActivityScannerRules.includes("rawEvidence"), "AI scanner candidates must keep compact provenance evidence");
assert(aiScannerPlan.includes("Sprint 5 - Weekly Operations"), "AI scanner plan must define the future sprint queue");

const maintenanceQueue = read("lib/content-maintenance-queue.ts");
assert(maintenanceQueue.includes("Zuidlaardermarktweek"), "content maintenance queue must track Zuidlaardermarkt follow-up");
assert(maintenanceQueue.includes("Open Muziek Podium"), "content maintenance queue must track Open Muziek Podium follow-up");

const reportsRoute = read("app/api/reports/route.ts");
assert(reportsRoute.includes("parseReportInput"), "public report route must use shared report input parsing");
assert(reportsRoute.includes("checkRateLimit"), "public report route must apply rate limiting");

const reportForm = read("components/activity-report-form.tsx");
assert(reportForm.includes("/api/reports"), "public activity detail must submit reports to the report intake endpoint");
assert(reportForm.includes("activityId: activity.id"), "public activity reports must include the activity slug");

const adminReports = read("components/admin-reports.tsx");
assert(adminReports.includes("/api/admin/reports/"), "admin reports UI must use the admin report moderation endpoint");
for (const status of ["reviewed", "dismissed", "open"]) {
  assert(adminReports.includes(status), `admin reports UI must expose ${status} handling`);
}

const auditCoverage = read("docs/audit-log-coverage.md");
assert(auditCoverage.includes("business.activity.publish"), "audit coverage docs must include publishing actions");
assert(auditCoverage.includes("admin.user.update"), "audit coverage docs must include admin user actions");
assert(auditCoverage.includes("notification_campaign.approve"), "audit coverage docs must include campaign approval actions");

const paymentWebhooks = read("lib/payment-webhooks.ts");
assert(paymentWebhooks.includes("verifyMollieWebhookSignature"), "payment webhook signature verification must remain implemented");
assert(paymentWebhooks.includes("normalizeMollieWebhookEvent"), "payment webhook event normalization must remain implemented");
assert(paymentWebhooks.includes("mollieWebhookAuditMetadata"), "payment webhook audit metadata must remain implemented");

const mediaValidation = read("lib/media-validation.ts");
assert(mediaValidation.includes("validateMediaUploadSize"), "media upload size validation must remain implemented");
assert(mediaValidation.includes("inspectImage"), "media image content validation must remain implemented");

const privacyProcessors = read("lib/privacy-processors.ts");
assert(privacyProcessors.includes("Mollie"), "privacy processor register must include prepared payment provider");
assert(privacyProcessors.includes("Analytics"), "privacy processor register must include analytics processor");

const ciWorkflow = read(".github/workflows/ci.yml");
for (const command of ["npm run lint", "npm run typecheck", "npm run test", "npm run test:e2e", "npm run build"]) {
  assert(ciWorkflow.includes(command), `CI workflow must run ${command}`);
}

const capabilities = buildMobileCapabilities();
assert(capabilities.endpoints.some((endpoint) => endpoint.path === "/api/public/activities"), "Mobile capabilities must expose public activities");
assert(capabilities.endpoints.some((endpoint) => endpoint.path === "/api/public/calendar"), "Mobile capabilities must expose public calendar feed");
assert(
  capabilities.endpoints.some((endpoint) => endpoint.path === "/api/public/activities/{activityId}/calendar"),
  "Mobile capabilities must expose single-activity calendar export",
);
assert(capabilities.endpoints.some((endpoint) => endpoint.path === "/api/me/agenda"), "Mobile capabilities must expose personal agenda");
assert(capabilities.endpoints.some((endpoint) => endpoint.path === "/api/me/agenda/calendar"), "Mobile capabilities must expose personal agenda calendar export");
assert(
  capabilities.calendarExports.some((endpoint) => endpoint.path === "/api/public/calendar" && endpoint.contentType === "text/calendar; charset=utf-8"),
  "Mobile capabilities must expose frozen calendar export contracts",
);

const activityCard = read("components/activity-card.tsx");
const activityDetailView = read("components/activity-detail-view.tsx");
const agendaShell = read("components/zuidlaren-agenda-shell.tsx");
const activityDetailPage = read("app/activity/[activityId]/page.tsx");
const rootLayout = read("app/layout.tsx");
const publicActivities = read("lib/public-activities.ts");
const publicActivityCache = read("lib/public-activity-cache.ts");
const homepage = read("app/page.tsx");
const analyticsSnapshot = read("lib/analytics-snapshot.ts");
const publicActivitiesRoute = read("app/api/public/activities/route.ts");
const prismaSelects = read("lib/prisma-selects.ts");
const personalAgenda = read("lib/personal-agenda.ts");
const notificationCampaigns = read("lib/notification-campaigns.ts");
const businessPermissions = read("lib/business-permissions.ts");
const adminActivitiesRoute = read("app/api/admin/activities/route.ts");
const adminBusinessesRoute = read("app/api/admin/businesses/route.ts");
const adminReportsRoute = read("app/api/admin/reports/route.ts");
const prismaSchema = read("prisma/schema.prisma");
assert(prismaSchema.includes("model ActivityScanCandidate"), "AI activity scanner must persist candidates for review and duplicate prevention");
assert(prismaSchema.includes("enum ActivityScanCandidateStatus"), "AI activity scanner must model candidate review states");
assert(prismaSchema.includes("duplicateScore") && prismaSchema.includes("qualityScore"), "AI scanner candidates must persist quality and duplicate scores");
const tsconfig = read("tsconfig.json");
const gitignore = read(".gitignore");
const analyticsEventsRoute = read("app/api/analytics/events/route.ts");
const webVitalsRoute = read("app/api/analytics/web-vitals/route.ts");
const webVitalsReporter = read("components/web-vitals-reporter.tsx");
const accountPanel = read("components/account-panel.tsx");
const seed = read("prisma/seed.ts");
assert(activityCard.includes("next/image"), "Activity cards must use next/image");
assert(activityDetailView.includes("next/image"), "Activity detail hero must use next/image");
assert(activityDetailView.includes("sendBeacon"), "Activity source analytics should use sendBeacon when available");
assert(!agendaShell.includes("use client"), "Agenda shell must remain a server component");
assert(activityDetailPage.includes("getPublicActivityDetail"), "Route-driven activity detail page must load public activity details");
assert(rootLayout.includes("next/font/google"), "Root layout must use next/font for typography");
assert(publicActivities.includes("unstable_cache"), "Public activity read model must use Next cache");
assert(publicActivities.includes("publicActivityFeedCacheTag"), "Public activity feed cache must use a shared tag");
assert(publicActivityCache.includes("revalidatePublicActivityCaches"), "Public activity cache invalidation helper must exist");
assert(homepage.includes("<Suspense"), "Homepage must stream filter controls and activity feed through Suspense");
assert(agendaShell.includes("FilterControlsSkeleton"), "Agenda shell must expose a filter loading skeleton");
assert(agendaShell.includes("ActivityFeedSkeleton"), "Agenda shell must expose an activity feed loading skeleton");
assert(homepage.includes("after(() => recordAnalyticsMetric"), "Homepage analytics must run after render");
assert(analyticsSnapshot.includes('by: ["metric"]'), "Analytics snapshot must group metric totals in one query");
assert(publicActivitiesRoute.includes("nextCursor"), "Public activities API must expose cursor pagination metadata");
assert(publicActivitiesRoute.includes("publicApiHeaders"), "Public activities API must use stable public API headers");
assert(publicActivitiesRoute.includes("public_activity_list"), "Public activities API must record public list analytics");
assert(prismaSelects.includes("activityRecordSelect"), "Shared Prisma selects must define the activity read model");
assert(personalAgenda.includes("getPersonalAgendaItems"), "Personal agenda reads must be shared between page and API");
assert(notificationCampaigns.includes("categorySlugs: { has"), "Campaign recipient filtering must run in SQL for categories");
assert(notificationCampaigns.includes("locationSlugs: { has"), "Campaign recipient filtering must run in SQL for locations");
assert(businessPermissions.includes("members: {"), "Business permission checks must load membership with the business query");
assert(adminActivitiesRoute.includes("parseCursorPagination"), "Admin activities API must use cursor pagination");
assert(adminBusinessesRoute.includes("parseCursorPagination"), "Admin businesses API must use cursor pagination");
assert(adminReportsRoute.includes("parseCursorPagination"), "Admin reports API must use cursor pagination");
assert(analyticsSnapshot.includes("createdAt: { gte: last30Days }"), "Analytics snapshot counts must stay inside the 30-day window");
assert(prismaSchema.includes("@@index([status, organizerName])"), "Activity organizer filter index must exist");
assert(prismaSchema.includes("@@index([status, indoorOutdoor])"), "Activity indoor/outdoor filter index must exist");
assert(tsconfig.includes('"target": "ES2022"'), "TypeScript target must stay on ES2022");
assert(gitignore.includes("tsconfig.tsbuildinfo"), "tsconfig.tsbuildinfo must remain ignored");
assert(analyticsEventsRoute.includes("select: {"), "Analytics events route must select only required activity fields");
assert(!analyticsEventsRoute.includes("include: {"), "Analytics events route must not include full activity relations");
assert(accountPanel.includes("setTimeout") && accountPanel.includes("300"), "Account preference saves must be buffered");
assert(webVitalsRoute.includes("web_vital"), "Web Vitals route must record aggregate web_vital analytics");
assert(webVitalsReporter.includes("useReportWebVitals"), "Client Web Vitals reporter must use Next web vitals hook");
assert(rootLayout.includes("WebVitalsReporter"), "Root layout must include the Web Vitals reporter");
assert(seed.includes("seedActivities"), "Seed script must use seed-local activity data");

const publicCalendarRoute = read("app/api/public/calendar/route.ts");
assert(publicCalendarRoute.includes("buildPublicCalendarFeed"), "Public calendar route must build an iCalendar feed");
assert(publicCalendarRoute.includes("getPublicActivityPage"), "Public calendar route must use the activity-only read model");
assert(!publicCalendarRoute.includes("getPublicActivityFeed"), "Public calendar route must not load filter options");
assert(publicCalendarRoute.includes("checkRateLimit"), "Public calendar route must rate limit exports");
assert(publicCalendarRoute.includes("prepareCalendarResponse"), "Public calendar route must use shared calendar response preparation");
assert(publicCalendarRoute.includes("recordAnalyticsMetric"), "Public calendar route must record aggregate calendar export analytics");

const publicActivityCalendarRoute = read("app/api/public/activities/[activityId]/calendar/route.ts");
assert(publicActivityCalendarRoute.includes("getPublicActivityDetail"), "Single-activity calendar route must read one public activity");
assert(publicActivityCalendarRoute.includes("buildPublicCalendarFeed([activity])"), "Single-activity calendar route must build a one-event iCalendar feed");
assert(publicActivityCalendarRoute.includes("checkRateLimit"), "Single-activity calendar route must rate limit exports");
assert(publicActivityCalendarRoute.includes("prepareCalendarResponse"), "Single-activity calendar route must use shared calendar response preparation");
assert(publicActivityCalendarRoute.includes("recordAnalyticsMetric"), "Single-activity calendar route must record aggregate calendar export analytics");

const personalAgendaCalendarRoute = read("app/api/me/agenda/calendar/route.ts");
assert(personalAgendaCalendarRoute.includes("getCurrentSession"), "Personal agenda calendar route must require a session");
assert(personalAgendaCalendarRoute.includes("Mijn Zuidlaren Agenda"), "Personal agenda calendar route must name the personal calendar feed");
assert(personalAgendaCalendarRoute.includes("sessionApiHeaders"), "Personal agenda calendar route must use private session API headers");
assert(personalAgendaCalendarRoute.includes("calendar_export"), "Personal agenda calendar route must record aggregate calendar export analytics");
assert(personalAgendaCalendarRoute.includes("calendarRateLimitKey"), "Personal agenda calendar route must rate limit by signed-in user");

const calendarFeedDocs = read("docs/calendar-feeds.md");
assert(calendarFeedDocs.includes("/api/public/calendar"), "Calendar feed docs must describe public calendar subscriptions");
assert(calendarFeedDocs.includes("/api/me/agenda/calendar"), "Calendar feed docs must describe private personal calendar exports");
assert(calendarFeedDocs.includes("X-Zuidlaren-Api-Version"), "Calendar feed docs must document version headers");
assert(calendarFeedDocs.includes("noindex, nofollow, noarchive"), "Calendar feed docs must document personal feed noindex headers");
assert(calendarFeedDocs.includes("Retry-After"), "Calendar feed docs must document rate limiting behavior");
assert(calendarFeedDocs.includes("If-None-Match"), "Calendar feed docs must document conditional request behavior");
assert(calendarFeedDocs.includes("Frozen Contract"), "Calendar feed docs must document the frozen calendar export contract");
assert(calendarFeedDocs.includes("calendar-client-troubleshooting"), "Calendar feed docs must link client troubleshooting notes");
assert(calendarFeedDocs.includes("calendar-support-faq"), "Calendar feed docs must link support FAQ");
assert(calendarFeedDocs.includes("calendar-maintenance-checklist"), "Calendar feed docs must link maintenance checklist");
assert(calendarFeedDocs.includes("calendar-documentation-map"), "Calendar feed docs must link documentation map");

const calendarAbuseDocs = read("docs/calendar-abuse-response.md");
assert(calendarAbuseDocs.includes("429"), "Calendar abuse docs must describe rate-limit responses");
assert(calendarAbuseDocs.includes("ETag"), "Calendar abuse docs must describe client cache behavior");
assert(calendarAbuseDocs.includes("agenda exports totaal"), "Calendar abuse docs must explain admin monitoring copy");

const calendarMetricsDocs = read("docs/calendar-metrics.md");
assert(calendarMetricsDocs.includes("calendar_export"), "Calendar metrics docs must describe the export metric");
assert(calendarMetricsDocs.includes("public_feed"), "Calendar metrics docs must describe public feed dimensions");
assert(calendarMetricsDocs.includes("single_activity"), "Calendar metrics docs must describe single activity dimensions");
assert(calendarMetricsDocs.includes("personal_agenda"), "Calendar metrics docs must describe personal agenda dimensions");
assert(calendarMetricsDocs.includes("304 Not Modified"), "Calendar metrics docs must explain conditional request metric behavior");

const calendarTroubleshootingDocs = read("docs/calendar-client-troubleshooting.md");
assert(calendarTroubleshootingDocs.includes("If-None-Match"), "Calendar troubleshooting docs must mention conditional client requests");
assert(calendarTroubleshootingDocs.includes("Retry-After"), "Calendar troubleshooting docs must mention rate-limit retry handling");
assert(calendarTroubleshootingDocs.includes("public calendar feed"), "Calendar troubleshooting docs must mention release check calendar detail");
assert(calendarTroubleshootingDocs.includes("calendar-support-faq"), "Calendar troubleshooting docs must link support FAQ");

const calendarSupportFaq = read("docs/calendar-support-faq.md");
assert(calendarSupportFaq.includes("private, no-store"), "Calendar support FAQ must explain personal export privacy");
assert(calendarSupportFaq.includes("If-None-Match"), "Calendar support FAQ must explain conditional request behavior");
assert(calendarSupportFaq.includes("Retry-After"), "Calendar support FAQ must explain rate-limit retry behavior");
assert(calendarSupportFaq.includes("calendar-client-troubleshooting"), "Calendar support FAQ must link troubleshooting docs");

const operatorHandoff = read("docs/operator-handoff.md");
const deploymentDocs = read("docs/DEPLOYMENT.md");
assert(operatorHandoff.includes("Calendar Exports"), "Operator handoff must include calendar export operations");
assert(operatorHandoff.includes("/api/public/calendar"), "Operator handoff must list the public calendar endpoint");
assert(deploymentDocs.includes("Source Rollback"), "Deployment docs must define source rollback");
assert(deploymentDocs.includes("Image Rollback"), "Deployment docs must define image rollback");
assert(deploymentDocs.includes("Database Migration Posture"), "Deployment docs must define database migration rollback posture");
assert(operatorHandoff.includes("Retry-After"), "Operator handoff must mention rate-limit retry handling");
assert(operatorHandoff.includes("If-None-Match"), "Operator handoff must mention conditional calendar requests");
assert(operatorHandoff.includes("noindex, nofollow, noarchive"), "Operator handoff must mention personal feed indexing controls");
assert(operatorHandoff.includes("calendar-runbook-drill"), "Operator handoff must link the calendar runbook drill");

const calendarRunbookDrill = read("docs/calendar-runbook-drill.md");
assert(calendarRunbookDrill.includes("public calendar feed"), "Calendar runbook drill must check release calendar output");
assert(calendarRunbookDrill.includes("BEGIN:VCALENDAR"), "Calendar runbook drill must check iCalendar body shape");
assert(calendarRunbookDrill.includes("private, no-store"), "Calendar runbook drill must check personal export privacy");
assert(calendarRunbookDrill.includes("If-None-Match"), "Calendar runbook drill must check conditional request behavior");
assert(calendarRunbookDrill.includes("calendar-maintenance-checklist"), "Calendar runbook drill must link maintenance checklist");

const calendarMaintenanceChecklist = read("docs/calendar-maintenance-checklist.md");
assert(calendarMaintenanceChecklist.includes("agenda exports totaal"), "Calendar maintenance checklist must include analytics review");
assert(calendarMaintenanceChecklist.includes("public calendar feed"), "Calendar maintenance checklist must include release-check review");
assert(calendarMaintenanceChecklist.includes("calendarEndpointContracts"), "Calendar maintenance checklist must mention contract update points");
assert(calendarMaintenanceChecklist.includes("public-api-changelog"), "Calendar maintenance checklist must mention changelog updates");
assert(calendarMaintenanceChecklist.includes("calendar-documentation-map"), "Calendar maintenance checklist must link documentation map");
assert(calendarMaintenanceChecklist.includes("public-api-governance-review"), "Calendar maintenance checklist must link governance review");
assert(calendarMaintenanceChecklist.includes("calendar-documentation-archive-review"), "Calendar maintenance checklist must link archive review");

const calendarDocumentationArchiveReview = read("docs/calendar-documentation-archive-review.md");
assert(calendarDocumentationArchiveReview.includes("Active Sources"), "Calendar documentation archive review must list active sources");
assert(calendarDocumentationArchiveReview.includes("Archive Rule"), "Calendar documentation archive review must include archive rules");
assert(calendarDocumentationArchiveReview.includes("implementation-plan/SPRINT-QUEUE.md"), "Calendar documentation archive review must preserve sprint history");
assert(calendarDocumentationArchiveReview.includes("scripts/launch-smoke.ts"), "Calendar documentation archive review must keep smoke focused on active docs");

const calendarDocumentationMap = read("docs/calendar-documentation-map.md");
assert(calendarDocumentationMap.includes("calendar-feeds.md"), "Calendar documentation map must route endpoint behavior");
assert(calendarDocumentationMap.includes("calendar-maintenance-checklist.md"), "Calendar documentation map must route maintenance tasks");
assert(calendarDocumentationMap.includes("calendar-support-faq.md"), "Calendar documentation map must route support questions");
assert(calendarDocumentationMap.includes("public-api-governance-review.md"), "Calendar documentation map must route API changes");
assert(calendarDocumentationMap.includes("calendar-documentation-archive-review.md"), "Calendar documentation map must route archive review");

const publicApiReleaseNotes = read("docs/public-api-release-notes.md");
assert(publicApiReleaseNotes.includes("X-Zuidlaren-Api-Version"), "Public API release notes must document the API version header");
assert(publicApiReleaseNotes.includes("/api/public/activities"), "Public API release notes must document public activities");
assert(publicApiReleaseNotes.includes("/api/public/calendar"), "Public API release notes must document public calendar export");
assert(publicApiReleaseNotes.includes("/api/me/agenda/calendar"), "Public API release notes must document personal calendar export");
assert(publicApiReleaseNotes.includes("public calendar feed"), "Public API release notes must document release-check calendar label");
assert(publicApiReleaseNotes.includes("public-api-changelog"), "Public API release notes must link the changelog");
assert(publicApiReleaseNotes.includes("public-api-docs-index"), "Public API release notes must link the docs index");

const publicApiChangelog = read("docs/public-api-changelog.md");
assert(publicApiChangelog.includes("Sprint 79"), "Public API changelog must include the governance smoke fixture entry");
assert(publicApiChangelog.includes("Sprint 77"), "Public API changelog must include the governance review entry");
assert(publicApiChangelog.includes("Sprint 75"), "Public API changelog must include the docs index entry");
assert(publicApiChangelog.includes("Sprint 73"), "Public API changelog must include the current changelog discipline entry");
assert(publicApiChangelog.includes("Sprint 72"), "Public API changelog must include the release notes snapshot entry");
assert(publicApiChangelog.includes("Sprint 68"), "Public API changelog must include the calendar contract freeze entry");
assert(publicApiChangelog.includes("public-api-release-notes"), "Public API changelog must point to the release notes snapshot");

const publicApiDocsIndex = read("docs/public-api-docs-index.md");
assert(publicApiDocsIndex.includes("public-api-release-notes"), "Public API docs index must link release notes");
assert(publicApiDocsIndex.includes("public-api-changelog"), "Public API docs index must link changelog");
assert(publicApiDocsIndex.includes("calendar-maintenance-checklist"), "Public API docs index must link calendar maintenance checklist");
assert(publicApiDocsIndex.includes("operator-handoff"), "Public API docs index must link operator handoff");
assert(publicApiDocsIndex.includes("public-api-governance-review"), "Public API docs index must link governance review");
assert(publicApiDocsIndex.includes("calendar-documentation-map"), "Public API docs index must link calendar documentation map");
assert(publicApiDocsIndex.includes("calendar-documentation-archive-review"), "Public API docs index must link calendar archive review");

const publicApiGovernanceReview = read("docs/public-api-governance-review.md");
assert(publicApiGovernanceReview.includes("public-api-release-notes"), "Public API governance review must require release notes review");
assert(publicApiGovernanceReview.includes("public-api-changelog"), "Public API governance review must require changelog review");
assert(publicApiGovernanceReview.includes("calendar-documentation-map"), "Public API governance review must require calendar map review");
assert(publicApiGovernanceReview.includes("X-Zuidlaren-Api-Version"), "Public API governance review must check API version behavior");
assert(publicApiGovernanceReview.includes("public-api-governance.ts"), "Public API governance review must mention governance fixtures");
assert(publicApiGovernanceRequiredDocs.includes("docs/public-api-release-notes.md"), "Public API governance fixture must include release notes docs");
assert(publicApiGovernanceRequiredDocs.includes("docs/calendar-documentation-map.md"), "Public API governance fixture must include calendar map docs");
assert(publicApiGovernanceRequiredChecks.includes("release-check"), "Public API governance fixture must include release-check review");

const authModule = read("lib/auth.ts");
assert(authModule.includes("const emailServer = process.env.EMAIL_SERVER"), "Email auth must read EMAIL_SERVER");
assert(authModule.includes("server: emailServer"), "Email auth must pass EMAIL_SERVER to NextAuth");
assert(authModule.includes("? {}"), "Email auth must skip the log override when EMAIL_SERVER is configured");
assert(authModule.includes("auth.login_link.created"), "Email auth must keep a local log fallback when EMAIL_SERVER is missing");
assert(authModule.includes("createLoginLinkFallbackRecord"), "Email auth must print a copyable fallback login link when SMTP is missing");
assert(authModule.includes("CredentialsProvider"), "Credential auth must remain available for seeded admin and test users");
assert(authModule.includes('strategy: "jwt"'), "Credential auth must use JWT sessions because NextAuth credentials do not support database sessions");

const adminLoginPage = read("app/admin/login/page.tsx");
assert(adminLoginPage.includes("CredentialsLoginForm"), "Admin login page must use the credential login form");
assert(adminLoginPage.includes('callbackUrl="/admin"'), "Admin login must return admins to /admin");

const seedScript = read("prisma/seed.ts");
for (const username of ["admin", "henk", "eigenaar"]) {
  assert(seedScript.includes(`|| "${username}"`), `Seed script must default ${username} credential username when opt-in seeding is enabled`);
}
assert(seedScript.includes('process.env.SEED_CREDENTIAL_ACCOUNTS !== "true"'), "Seeded credential accounts must be explicitly enabled");
assert(seedScript.includes('requiredSeedPassword("SEED_ADMIN_PASSWORD")'), "Seed script must require admin password from the environment");
assert(seedScript.includes('requiredSeedPassword("SEED_USER_PASSWORD")'), "Seed script must require test user password from the environment");
assert(seedScript.includes('requiredSeedPassword("SEED_OWNER_PASSWORD")'), "Seed script must require owner password from the environment");
assert(seedScript.includes('role: "OWNER"'), "Seed script must make eigenaar a business owner");

const credentialSeedScript = read("scripts/seed-credentials.mjs");
assert(packageJson.scripts["seed:credentials"] === "node scripts/seed-credentials.mjs", "package.json must expose a production-safe credential seed command");
assert(credentialSeedScript.includes('requiredEnv("SEED_ADMIN_PASSWORD")'), "Production credential seed script must require the admin password from env");
assert(credentialSeedScript.includes('ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "credentialLogin"'), "Production credential seed script must prepare credential columns");
assert(credentialSeedScript.includes('CREATE UNIQUE INDEX IF NOT EXISTS "User_credentialLogin_key"'), "Production credential seed script must prepare the credential login unique index");
assert(credentialSeedScript.includes('role: "OWNER"'), "Production credential seed script must link eigenaar as owner when a business exists");

const loginLinkFallback = read("lib/login-link-fallback.ts");
assert(loginLinkFallback.includes("auth.login_link.fallback"), "Email auth fallback must expose a copyable login link event when SMTP is missing");
assert(loginLinkFallback.includes("loginLink: url"), "Email auth fallback must print the magic login link when SMTP is missing");

const filterControls = read("components/filter-controls.tsx");
assert(filterControls.includes("filter-menu-row"), "Public agenda filters must render one compact dropdown row");
assert(filterControls.includes("renderFilterSelect"), "Public agenda filters must expose compact dropdown controls");
assert(filterControls.includes("<select"), "Public agenda secondary filters must use dropdown controls");
assert(filterControls.includes("options.categories"), "Public agenda category filters must use available event categories");
assert(filterControls.includes("useMemo"), "Filter controls must memoize option maps");

assert(!agendaShell.includes("getPublicActivities"), "Public agenda shell must not fall back to mock activities after filtering");
assert(agendaShell.includes("enableFilterLinks"), "Public agenda cards must expose tag filter links");

assert(activityCard.includes("tag-link"), "Activity card tags must be usable as filter links");
assert(activityCard.includes("filterHref(\"category\""), "Activity card category tags must link to category filters");

const publicActivityQuery = read("lib/public-activity-query.ts");
assert(publicActivityQuery.includes("const defaultLimit = 50"), "Public activity queries must default to 50 activities");
assert(publicActivityQuery.includes("defaultFrom"), "Public activity queries must default to today and later");
assert(publicActivityQuery.includes("hasCustomDateFilter"), "Public activity queries must allow explicit past date ranges");
assert(publicActivityQuery.includes("hasSome: tagVariants"), "Public activity search must match visible tag labels case-insensitively");

const perfBudgetScript = read("scripts/perf-budget.ts");
assert(packageJson.scripts["perf:budget"], "package.json must expose the performance budget command");
assert(perfBudgetScript.includes("/business/[businessId]"), "Performance budget must cover the business dashboard route");
assert(perfBudgetScript.includes("gzip"), "Performance budget must check gzip asset sizes");

const releaseCheckScript = read("scripts/release-check.ts");
assert(releaseCheckScript.includes("releaseHealthWarnings"), "release check must fail on release health warnings");
assert(releaseCheckScript.includes("content-type="), "release check output must include response content type details");

const releaseChecks = read("lib/release-checks.ts");
assert(releaseChecks.includes("/api/public/calendar?limit=3"), "Release checks must include the public calendar feed");
assert(releaseChecks.includes("public calendar feed"), "Release checks must label the public calendar feed");

const queue = read("implementation-plan/SPRINT-QUEUE.md");
assert(queue.includes("## Sprint 19 - MVP Launch Readiness"), "Sprint 19 must be listed in the queue");
assert(queue.includes("Status: Done"), "Sprint queue should contain completed sprint statuses");

const prismaModule = read("lib/prisma.ts");
assert(prismaModule.includes("prisma.slow_query"), "Prisma module must warn on slow queries in non-production");
assert(prismaModule.includes("prisma.repeated_query"), "Prisma module must warn on repeated query shapes in non-production");

const observabilityPlan = read("implementation-plan/16-analytics-and-observability.md");
assert(observabilityPlan.includes("Web Vitals"), "Observability docs must describe Web Vitals aggregation");
const deploymentPlan = read("implementation-plan/19-deployment-tailscale-linux.md");
assert(deploymentPlan.includes("perf:budget"), "Deployment docs must mention the performance budget check");

console.info("Launch smoke checks passed");
