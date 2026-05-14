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
  "docs/mvp-launch-readiness.md",
  "docs/mobile-api-readiness.md",
  ".env.example",
  "docker-compose.yml",
];

for (const file of requiredFiles) {
  assertFile(file);
}

const packageJson = JSON.parse(read("package.json")) as { scripts: Record<string, string> };
const requiredScripts = ["lint", "typecheck", "test", "test:e2e", "build", "dev:3088", "start:3088", "health", "db:seed"];

for (const script of requiredScripts) {
  assert(packageJson.scripts[script], `Missing package script: ${script}`);
}

const envExample = read(".env.example");
for (const key of ["DATABASE_URL", "NEXTAUTH_URL", "NEXTAUTH_SECRET", "EMAIL_FROM", "PORT=3088"]) {
  assert(envExample.includes(key), `.env.example is missing ${key}`);
}

const dockerCompose = read("docker-compose.yml");
assert(dockerCompose.includes('cpuset: "0-1"'), 'docker-compose.yml must pin the web service with cpuset: "0-1"');

const capabilities = buildMobileCapabilities();
assert(capabilities.endpoints.some((endpoint) => endpoint.path === "/api/public/activities"), "Mobile capabilities must expose public activities");
assert(capabilities.endpoints.some((endpoint) => endpoint.path === "/api/me/agenda"), "Mobile capabilities must expose personal agenda");

const queue = read("implementation-plan/SPRINT-QUEUE.md");
assert(queue.includes("## Sprint 19 - MVP Launch Readiness"), "Sprint 19 must be listed in the queue");
assert(queue.includes("Status: Done"), "Sprint queue should contain completed sprint statuses");

console.info("Launch smoke checks passed");
