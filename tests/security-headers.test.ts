import assert from "node:assert/strict";
import { test } from "node:test";
import { securityHeaders, securityHeadersForNext } from "@/lib/security-headers";

test("security headers include baseline browser protections", () => {
  const headers = new Map(securityHeaders.map((header) => [header.key, header.value]));

  assert.equal(headers.get("X-Frame-Options"), "DENY");
  assert.equal(headers.get("X-Content-Type-Options"), "nosniff");
  assert.equal(headers.get("Referrer-Policy"), "strict-origin-when-cross-origin");
  assert.equal(headers.get("Permissions-Policy"), "camera=(), microphone=(), geolocation=(), payment=()");
});

test("content security policy blocks framing and object embeds", () => {
  const csp = securityHeaders.find((header) => header.key === "Content-Security-Policy")?.value ?? "";

  assert.match(csp, /default-src 'self'/);
  assert.match(csp, /frame-ancestors 'none'/);
  assert.match(csp, /object-src 'none'/);
  assert.match(csp, /img-src 'self' data: blob: https:\/\/images\.unsplash\.com/);
  assert.doesNotMatch(csp, /unsafe-eval/);
});

test("security headers are applied to all Next routes", () => {
  assert.deepEqual(securityHeadersForNext(), [
    {
      source: "/(.*)",
      headers: securityHeaders,
    },
  ]);
});
