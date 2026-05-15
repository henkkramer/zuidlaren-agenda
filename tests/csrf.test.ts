import assert from "node:assert/strict";
import { test } from "node:test";
import { allowedMutationOrigins, isSameOriginMutationRequest } from "@/lib/csrf";

function request(input: { headers?: Record<string, string>; method?: string; url?: string }) {
  return new Request(input.url ?? "https://agenda.example.nl/api/me/profile", {
    headers: input.headers,
    method: input.method ?? "PATCH",
  });
}

test("same-origin mutation guard allows safe methods and same-origin mutations", () => {
  assert.equal(isSameOriginMutationRequest(request({ method: "GET", headers: { origin: "https://evil.example" } })), true);
  assert.equal(isSameOriginMutationRequest(request({ headers: { origin: "https://agenda.example.nl" } })), true);
});

test("same-origin mutation guard allows configured app origins", () => {
  const result = isSameOriginMutationRequest(request({ headers: { origin: "https://zuidlaren.example.nl" } }), {
    APP_BASE_URL: "https://zuidlaren.example.nl",
    NEXTAUTH_URL: undefined,
  });

  assert.equal(result, true);
});

test("same-origin mutation guard blocks cross-site fetch metadata and foreign origins", () => {
  assert.equal(isSameOriginMutationRequest(request({ headers: { "sec-fetch-site": "cross-site" } })), false);
  assert.equal(isSameOriginMutationRequest(request({ headers: { origin: "https://evil.example" } })), false);
});

test("allowed mutation origins include request and configured auth origins", () => {
  assert.deepEqual(
    [...allowedMutationOrigins("https://agenda.example.nl/api", {
      APP_BASE_URL: "https://app.example.nl",
      NEXTAUTH_URL: "https://auth.example.nl",
    })].sort(),
    ["https://agenda.example.nl", "https://app.example.nl", "https://auth.example.nl"],
  );
});
