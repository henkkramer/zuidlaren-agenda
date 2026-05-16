import assert from "node:assert/strict";
import { test } from "node:test";
import { buildMobileCapabilities, calendarEndpointContracts, mobileApiVersion, mobileEndpointContracts } from "@/lib/mobile-contracts";

test("mobile capabilities expose stable versioned contracts", () => {
  const capabilities = buildMobileCapabilities();

  assert.equal(capabilities.apiVersion, mobileApiVersion);
  assert.equal(capabilities.locale, "nl-NL");
  assert.equal(capabilities.auth.supportsBearerTokens, false);
  assert.deepEqual(capabilities.auth.plannedOAuthProviders, ["apple", "google"]);
  assert.deepEqual(capabilities.push.plannedProviders, ["apns", "fcm"]);
  assert.ok(capabilities.endpoints.some((endpoint) => endpoint.path === "/api/public/activities" && endpoint.auth === "public"));
  assert.ok(capabilities.endpoints.some((endpoint) => endpoint.path === "/api/public/calendar" && endpoint.auth === "public"));
  assert.ok(capabilities.endpoints.some((endpoint) => endpoint.path === "/api/public/activities/{activityId}/calendar" && endpoint.auth === "public"));
  assert.ok(capabilities.endpoints.some((endpoint) => endpoint.path === "/api/me/agenda" && endpoint.auth === "session"));
  assert.ok(capabilities.endpoints.some((endpoint) => endpoint.path === "/api/me/agenda/calendar" && endpoint.auth === "session"));
  assert.deepEqual(capabilities.calendarExports, calendarEndpointContracts);
});

test("mobile endpoint contracts include attendance mutations", () => {
  const attendanceMethods = mobileEndpointContracts
    .filter((endpoint) => endpoint.path === "/api/activities/{activityId}/attendance")
    .map((endpoint) => endpoint.method)
    .sort();

  assert.deepEqual(attendanceMethods, ["DELETE", "PATCH", "POST"]);
});

test("calendar export contracts are frozen for public and personal clients", () => {
  assert.deepEqual(
    calendarEndpointContracts.map((endpoint) => ({
      auth: endpoint.auth,
      cache: endpoint.cache,
      contentType: endpoint.contentType,
      method: endpoint.method,
      path: endpoint.path,
      rateLimit: endpoint.rateLimit,
    })),
    [
      {
        auth: "public",
        cache: "public, max-age=60, stale-while-revalidate=300",
        contentType: "text/calendar; charset=utf-8",
        method: "GET",
        path: "/api/public/calendar",
        rateLimit: "429 with Retry-After",
      },
      {
        auth: "public",
        cache: "public, max-age=60, stale-while-revalidate=300",
        contentType: "text/calendar; charset=utf-8",
        method: "GET",
        path: "/api/public/activities/{activityId}/calendar",
        rateLimit: "429 with Retry-After",
      },
      {
        auth: "session",
        cache: "private, no-store",
        contentType: "text/calendar; charset=utf-8",
        method: "GET",
        path: "/api/me/agenda/calendar",
        rateLimit: "429 with Retry-After",
      },
    ],
  );

  assert.ok(calendarEndpointContracts.every((endpoint) => endpoint.conditionalRequests.includes("If-None-Match")));
});
