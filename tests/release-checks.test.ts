import assert from "node:assert/strict";
import { test } from "node:test";
import { buildReleaseCheckUrls, normalizeReleaseBaseUrl, releaseCheckEndpoints } from "@/lib/release-checks";

test("release base URL is required and normalized", () => {
  assert.throws(() => normalizeReleaseBaseUrl(""), /RELEASE_BASE_URL is required/);
  assert.equal(normalizeReleaseBaseUrl(" https://agenda.example.nl/app///?x=1#hash "), "https://agenda.example.nl/app");
});

test("release check URL plan includes required runtime endpoints", () => {
  const urls = buildReleaseCheckUrls("https://agenda.example.nl/");

  assert.equal(urls.length, releaseCheckEndpoints.length);
  assert.ok(urls.every((check) => check.required));
  assert.deepEqual(
    urls.map((check) => check.url),
    [
      "https://agenda.example.nl/api/health",
      "https://agenda.example.nl/api/health/ready",
      "https://agenda.example.nl/api/health/release",
      "https://agenda.example.nl/api/mobile/capabilities",
      "https://agenda.example.nl/api/public/activities?limit=3",
    ],
  );
});
