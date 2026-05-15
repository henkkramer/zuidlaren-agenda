import assert from "node:assert/strict";
import { test } from "node:test";
import {
  parseAdminActivityStatus,
  parseAdminBusinessStatus,
  parseAdminReportResolution,
  parseAdminReportStatus,
} from "@/lib/admin-status-input";

test("admin activity status parser maps allowed values", () => {
  assert.equal(parseAdminActivityStatus("draft"), "DRAFT");
  assert.equal(parseAdminActivityStatus("scheduled"), "SCHEDULED");
  assert.equal(parseAdminActivityStatus("published"), "PUBLISHED");
  assert.equal(parseAdminActivityStatus("unpublished"), "UNPUBLISHED");
  assert.equal(parseAdminActivityStatus("expired"), "EXPIRED");
  assert.equal(parseAdminActivityStatus("deleted"), null);
});

test("admin business status parser maps allowed values", () => {
  assert.equal(parseAdminBusinessStatus("pending"), "PENDING");
  assert.equal(parseAdminBusinessStatus("approved"), "APPROVED");
  assert.equal(parseAdminBusinessStatus("suspended"), "SUSPENDED");
  assert.equal(parseAdminBusinessStatus("archived"), null);
});

test("admin report status parser maps allowed values and trims resolution", () => {
  assert.equal(parseAdminReportStatus("open"), "OPEN");
  assert.equal(parseAdminReportStatus("reviewed"), "REVIEWED");
  assert.equal(parseAdminReportStatus("dismissed"), "DISMISSED");
  assert.equal(parseAdminReportStatus("closed"), null);
  assert.equal(parseAdminReportResolution("  opgelost  "), "opgelost");
  assert.equal(parseAdminReportResolution(false), undefined);
});
