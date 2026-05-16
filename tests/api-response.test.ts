import assert from "node:assert/strict";
import { test } from "node:test";
import { publicApiCacheControl, publicApiHeaders, sessionApiHeaders } from "@/lib/api-response";

test("public API headers expose version and short-lived shared cache", () => {
  assert.equal(publicApiCacheControl, "public, max-age=60, stale-while-revalidate=300");
  assert.deepEqual(publicApiHeaders("2026-05-14"), {
    "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
    "X-Zuidlaren-Api-Version": "2026-05-14",
  });
});

test("session API headers expose version and disable shared caching", () => {
  assert.deepEqual(sessionApiHeaders("2026-05-14"), {
    "Cache-Control": "private, no-store",
    "X-Zuidlaren-Api-Version": "2026-05-14",
    "X-Robots-Tag": "noindex, nofollow, noarchive",
  });
});
