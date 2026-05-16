import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { buildMobileCapabilities } from "@/lib/mobile-contracts";

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
  ".github/workflows/ci.yml",
  "docs/ci-release-gate.md",
  "docs/audit-log-coverage.md",
  "docs/mvp-launch-readiness.md",
  "docs/mobile-api-readiness.md",
  "docs/calendar-feeds.md",
  "docs/calendar-abuse-response.md",
  "docs/operator-handoff.md",
  "docs/pr-release-handoff.md",
  "scripts/ensure-admin.ts",
  "scripts/release-check.ts",
  ".env.example",
  "docker-compose.yml",
];

for (const file of requiredFiles) {
  assertFile(file);
}

const packageJson = JSON.parse(read("package.json")) as { scripts: Record<string, string> };
const requiredScripts = ["lint", "typecheck", "test", "test:e2e", "build", "dev:3088", "start:3088", "health", "release:check", "admin:ensure", "db:seed"];

for (const script of requiredScripts) {
  assert(packageJson.scripts[script], `Missing package script: ${script}`);
}
assert(packageJson.scripts.typecheck.includes("prisma generate"), "typecheck must generate Prisma Client before tsc");

const envExample = read(".env.example");
for (const key of ["DATABASE_URL", "NEXTAUTH_URL", "NEXTAUTH_SECRET", "EMAIL_FROM", "ADMIN_EMAIL", "RELEASE_BASE_URL", "PORT=3088"]) {
  assert(envExample.includes(key), `.env.example is missing ${key}`);
}

const dockerCompose = read("docker-compose.yml");
assert(dockerCompose.includes('cpuset: "0-1"'), 'docker-compose.yml must pin the web service with cpuset: "0-1"');

const nextConfig = read("next.config.ts");
assert(nextConfig.includes("securityHeadersForNext"), "next.config.ts must apply shared security headers");

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

const publicActivitiesRoute = read("app/api/public/activities/route.ts");
assert(publicActivitiesRoute.includes("nextCursor"), "Public activities API must expose cursor pagination metadata");
assert(publicActivitiesRoute.includes("publicApiHeaders"), "Public activities API must use stable public API headers");

const publicCalendarRoute = read("app/api/public/calendar/route.ts");
assert(publicCalendarRoute.includes("buildPublicCalendarFeed"), "Public calendar route must build an iCalendar feed");
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

const calendarAbuseDocs = read("docs/calendar-abuse-response.md");
assert(calendarAbuseDocs.includes("429"), "Calendar abuse docs must describe rate-limit responses");
assert(calendarAbuseDocs.includes("ETag"), "Calendar abuse docs must describe client cache behavior");
assert(calendarAbuseDocs.includes("agenda exports totaal"), "Calendar abuse docs must explain admin monitoring copy");

const operatorHandoff = read("docs/operator-handoff.md");
assert(operatorHandoff.includes("Calendar Exports"), "Operator handoff must include calendar export operations");
assert(operatorHandoff.includes("/api/public/calendar"), "Operator handoff must list the public calendar endpoint");
assert(operatorHandoff.includes("Retry-After"), "Operator handoff must mention rate-limit retry handling");
assert(operatorHandoff.includes("If-None-Match"), "Operator handoff must mention conditional calendar requests");
assert(operatorHandoff.includes("noindex, nofollow, noarchive"), "Operator handoff must mention personal feed indexing controls");

const releaseCheckScript = read("scripts/release-check.ts");
assert(releaseCheckScript.includes("releaseHealthWarnings"), "release check must fail on release health warnings");

const releaseChecks = read("lib/release-checks.ts");
assert(releaseChecks.includes("/api/public/calendar?limit=3"), "Release checks must include the public calendar feed");

const queue = read("implementation-plan/SPRINT-QUEUE.md");
assert(queue.includes("## Sprint 19 - MVP Launch Readiness"), "Sprint 19 must be listed in the queue");
assert(queue.includes("Status: Done"), "Sprint queue should contain completed sprint statuses");

console.info("Launch smoke checks passed");
