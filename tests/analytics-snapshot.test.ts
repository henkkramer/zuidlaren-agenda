import assert from "node:assert/strict";
import { test } from "node:test";
import { summarizeCalendarExportBreakdown } from "@/lib/analytics-breakdown";

test("calendar export breakdown summarizes dimensions by kind", () => {
  const breakdown = summarizeCalendarExportBreakdown([
    { dimensionsKey: "filtered:true|kind:public_feed", _sum: { count: 3 } },
    { dimensionsKey: "kind:personal_agenda", _sum: { count: 5 } },
    { dimensionsKey: "kind:single_activity", _sum: { count: null } },
    { dimensionsKey: "global", _sum: { count: 2 } },
  ]);

  assert.deepEqual(breakdown, [
    { kind: "personal_agenda", count: 5 },
    { kind: "public_feed", count: 3 },
    { kind: "unknown", count: 2 },
  ]);
});
