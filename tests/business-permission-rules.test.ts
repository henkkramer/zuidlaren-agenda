import assert from "node:assert/strict";
import { test } from "node:test";
import { evaluateBusinessPermission } from "@/lib/business-permission-rules";

test("owner can manage members and publish for approved business", () => {
  const input = {
    businessStatus: "APPROVED",
    canPublishActivities: false,
    membershipActive: true,
    role: "OWNER",
  };

  assert.deepEqual(evaluateBusinessPermission(input, "manageMembers"), { ok: true });
  assert.deepEqual(evaluateBusinessPermission(input, "publishActivities"), { ok: true });
});

test("employee cannot manage members", () => {
  const result = evaluateBusinessPermission(
    {
      businessStatus: "APPROVED",
      canPublishActivities: true,
      membershipActive: true,
      role: "EMPLOYEE",
    },
    "manageMembers",
  );

  assert.equal(result.ok, false);
  assert.equal(result.status, 403);
});

test("employee can publish only with explicit permission and approved business", () => {
  assert.deepEqual(
    evaluateBusinessPermission(
      {
        businessStatus: "APPROVED",
        canPublishActivities: true,
        membershipActive: true,
        role: "EMPLOYEE",
      },
      "publishActivities",
    ),
    { ok: true },
  );

  assert.equal(
    evaluateBusinessPermission(
      {
        businessStatus: "PENDING",
        canPublishActivities: true,
        membershipActive: true,
        role: "EMPLOYEE",
      },
      "publishActivities",
    ).ok,
    false,
  );

  assert.equal(
    evaluateBusinessPermission(
      {
        businessStatus: "APPROVED",
        canPublishActivities: false,
        membershipActive: true,
        role: "EMPLOYEE",
      },
      "publishActivities",
    ).ok,
    false,
  );
});

test("inactive membership has no business access", () => {
  const result = evaluateBusinessPermission({
    businessStatus: "APPROVED",
    canPublishActivities: true,
    membershipActive: false,
    role: "OWNER",
  });

  assert.deepEqual(result, { ok: false, status: 403, error: "Geen toegang tot dit bedrijf" });
});
