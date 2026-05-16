import assert from "node:assert/strict";
import { test } from "node:test";
import { buildPublicActivityCursor, buildPublicActivityCursorWhere, parsePublicActivityCursor } from "@/lib/public-activity-pagination";
import { parseActivityFilters } from "@/lib/public-activity-query";

test("public activity cursors round-trip start time and slug", () => {
  const cursor = buildPublicActivityCursor({ slug: "open-podium", startAt: new Date("2026-06-04T19:30:00.000Z") });
  const parsed = parsePublicActivityCursor(cursor);

  assert.equal(parsed?.slug, "open-podium");
  assert.equal(parsed?.startAt.toISOString(), "2026-06-04T19:30:00.000Z");
  assert.equal(parsePublicActivityCursor("broken"), null);
});

test("public activity cursor where advances after matching start time and slug", () => {
  const cursor = buildPublicActivityCursor({ slug: "open-podium", startAt: new Date("2026-06-04T19:30:00.000Z") });
  const where = buildPublicActivityCursorWhere(cursor);

  assert.deepEqual(where, {
    OR: [
      { startAt: { gt: new Date("2026-06-04T19:30:00.000Z") } },
      {
        AND: [{ startAt: new Date("2026-06-04T19:30:00.000Z") }, { slug: { gt: "open-podium" } }],
      },
    ],
  });
});

test("activity filter parser keeps cursor for API pagination", () => {
  const cursor = buildPublicActivityCursor({ slug: "markt", startAt: new Date("2026-05-20T10:00:00.000Z") });
  const filters = parseActivityFilters({ cursor, limit: "12" });

  assert.equal(filters.cursor, cursor);
  assert.equal(filters.limit, 12);
});
