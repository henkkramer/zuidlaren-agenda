import assert from "node:assert/strict";
import { test } from "node:test";
import { accessDeniedResponse, badRequestResponse } from "@/lib/route-helpers";

test("route helpers keep shared error response shape", async () => {
  const denied = accessDeniedResponse({ ok: false, error: "Geen toegang", status: 403 });

  assert.equal(denied.status, 403);
  assert.deepEqual(await denied.json(), { error: "Geen toegang" });

  const badRequest = badRequestResponse("Ongeldige invoer");

  assert.equal(badRequest.status, 400);
  assert.deepEqual(await badRequest.json(), { error: "Ongeldige invoer" });
});