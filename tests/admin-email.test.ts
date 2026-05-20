import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeAdminEmail, shouldPromoteAdminUser } from "@/lib/admin-email";

test("admin email normalization trims and lowercases configured addresses", () => {
  assert.equal(normalizeAdminEmail("  OWNER@Example.NL "), "owner@example.nl");
  assert.equal(normalizeAdminEmail(" "), null);
  assert.equal(normalizeAdminEmail(undefined), null);
});

test("admin promotion only matches the configured admin mailbox", () => {
  assert.equal(shouldPromoteAdminUser("owner@example.nl", "OWNER@example.nl"), true);
  assert.equal(shouldPromoteAdminUser("other@example.nl", "owner@example.nl"), false);
  assert.equal(shouldPromoteAdminUser("owner@example.nl", null), false);
});
