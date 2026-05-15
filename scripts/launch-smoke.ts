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
  "app/api/public/activities/route.ts",
  "app/api/mobile/capabilities/route.ts",
  "lib/csrf.ts",
  "lib/audit-actions.ts",
  "lib/security-headers.ts",
  "lib/release-checks.ts",
  ".github/workflows/ci.yml",
  "docs/ci-release-gate.md",
  "docs/audit-log-coverage.md",
  "docs/mvp-launch-readiness.md",
  "docs/mobile-api-readiness.md",
  "docs/operator-handoff.md",
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

const businessActivityRoute = read("app/api/businesses/[businessId]/activities/route.ts");
assert(businessActivityRoute.includes("rejectCrossOriginMutation"), "business activity mutation route must apply CSRF origin guard");

const adminUserRoute = read("app/api/admin/users/[userId]/route.ts");
assert(adminUserRoute.includes("rejectCrossOriginMutation"), "admin user mutation route must apply CSRF origin guard");

const auditCoverage = read("docs/audit-log-coverage.md");
assert(auditCoverage.includes("business.activity.publish"), "audit coverage docs must include publishing actions");
assert(auditCoverage.includes("admin.user.update"), "audit coverage docs must include admin user actions");
assert(auditCoverage.includes("notification_campaign.approve"), "audit coverage docs must include campaign approval actions");

const ciWorkflow = read(".github/workflows/ci.yml");
for (const command of ["npm run lint", "npm run typecheck", "npm run test", "npm run test:e2e", "npm run build"]) {
  assert(ciWorkflow.includes(command), `CI workflow must run ${command}`);
}

const capabilities = buildMobileCapabilities();
assert(capabilities.endpoints.some((endpoint) => endpoint.path === "/api/public/activities"), "Mobile capabilities must expose public activities");
assert(capabilities.endpoints.some((endpoint) => endpoint.path === "/api/me/agenda"), "Mobile capabilities must expose personal agenda");

const queue = read("implementation-plan/SPRINT-QUEUE.md");
assert(queue.includes("## Sprint 19 - MVP Launch Readiness"), "Sprint 19 must be listed in the queue");
assert(queue.includes("Status: Done"), "Sprint queue should contain completed sprint statuses");

console.info("Launch smoke checks passed");
