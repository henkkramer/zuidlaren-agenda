import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { sensitiveAuditActions } from "@/lib/audit-actions";

const root = process.cwd();

test("sensitive audit actions are unique and documented in source files", () => {
  const actions = new Set<string>();

  for (const entry of sensitiveAuditActions) {
    assert.equal(actions.has(entry.action), false, `Duplicate audit action ${entry.action}`);
    actions.add(entry.action);

    const source = readFileSync(join(root, entry.source), "utf8");
    assert.match(source, new RegExp(entry.action.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `${entry.action} missing from ${entry.source}`);
  }
});

test("audit coverage includes required sensitive action groups", () => {
  const actions = sensitiveAuditActions.map((entry) => entry.action);

  for (const prefix of ["operator.admin.", "business.member.", "business.activity.", "notification_campaign.", "admin."]) {
    assert.ok(actions.some((action) => action.startsWith(prefix)), `Missing audit action group ${prefix}`);
  }
});
