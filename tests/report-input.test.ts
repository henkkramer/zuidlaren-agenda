import assert from "node:assert/strict";
import { test } from "node:test";
import { parseReportInput } from "@/lib/report-input";

test("report input trims reason details and optional activity slug", () => {
  assert.deepEqual(
    parseReportInput({
      activityId: " zomerfeest ",
      details: "  Onjuiste tijd  ",
      reason: "  Onjuiste informatie  ",
    }),
    {
      activityId: "zomerfeest",
      details: "Onjuiste tijd",
      reason: "Onjuiste informatie",
    },
  );
});

test("report input allows general reports without details", () => {
  assert.deepEqual(parseReportInput({ reason: "Spam" }), {
    activityId: null,
    details: null,
    reason: "Spam",
  });
});

test("report input rejects invalid reason and excessive details", () => {
  assert.throws(() => parseReportInput({ reason: "  " }), /Reden moet 3 tot 120 tekens zijn/);
  assert.throws(() => parseReportInput({ reason: "x".repeat(121) }), /Reden moet 3 tot 120 tekens zijn/);
  assert.throws(() => parseReportInput({ reason: "Spam", details: "x".repeat(1001) }), /Toelichting mag maximaal 1000 tekens zijn/);
});
