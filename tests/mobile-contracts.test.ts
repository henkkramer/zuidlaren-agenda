import assert from "node:assert/strict";
import { test } from "node:test";
import { buildMobileCapabilities, mobileApiVersion, mobileEndpointContracts } from "@/lib/mobile-contracts";

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
});

test("mobile endpoint contracts include attendance mutations", () => {
  const attendanceMethods = mobileEndpointContracts
    .filter((endpoint) => endpoint.path === "/api/activities/{activityId}/attendance")
    .map((endpoint) => endpoint.method)
    .sort();

  assert.deepEqual(attendanceMethods, ["DELETE", "PATCH", "POST"]);
});
