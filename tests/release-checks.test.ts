import assert from "node:assert/strict";
import { test } from "node:test";
import { buildReleaseCheckUrls, normalizeReleaseBaseUrl, releaseCheckEndpoints, releaseHealthWarnings } from "@/lib/release-checks";

test("release base URL is required and normalized", () => {
  assert.throws(() => normalizeReleaseBaseUrl(""), /RELEASE_BASE_URL is required/);
  assert.equal(normalizeReleaseBaseUrl(" https://agenda.example.nl/app///?x=1#hash "), "https://agenda.example.nl/app");
});

test("release check URL plan includes required runtime endpoints", () => {
  const urls = buildReleaseCheckUrls("https://agenda.example.nl/");

  assert.equal(urls.length, releaseCheckEndpoints.length);
  assert.ok(urls.every((check) => check.required));
  assert.deepEqual(
    urls.map((check) => ({ accept: check.accept, label: check.label, url: check.url })),
    [
      { accept: "application/json", label: "process health", url: "https://agenda.example.nl/api/health" },
      { accept: "application/json", label: "database readiness", url: "https://agenda.example.nl/api/health/ready" },
      { accept: "application/json", label: "release health", url: "https://agenda.example.nl/api/health/release" },
      { accept: "application/json", label: "mobile capabilities", url: "https://agenda.example.nl/api/mobile/capabilities" },
      { accept: "application/json", label: "public activities", url: "https://agenda.example.nl/api/public/activities?limit=3" },
      { accept: "text/calendar", label: "public calendar feed", url: "https://agenda.example.nl/api/public/calendar?limit=3" },
    ],
  );
});

test("release health warnings are extracted from release check payloads", () => {
  assert.deepEqual(
    releaseHealthWarnings({
      checks: {
        adminUsers: "warning",
        categories: 8,
        database: "ok",
        locations: "warning",
      },
    }),
    ["adminUsers", "locations"],
  );
  assert.deepEqual(releaseHealthWarnings({ ok: true }), []);
  assert.deepEqual(releaseHealthWarnings(null), []);
});
