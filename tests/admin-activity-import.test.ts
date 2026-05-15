import assert from "node:assert/strict";
import { test } from "node:test";
import { parseActivityImportPreview } from "@/lib/admin-activity-import";
import { contentMaintenanceQueue } from "@/lib/content-maintenance-queue";

test("activity import preview parses valid rows and warnings", () => {
  const rows = parseActivityImportPreview(
    [
      "title;startAt;endAt;locationName;shortDescription;description;sourceUrl;category;typeTags",
      "Open Podium;2026-06-04T19:30:00;2026-06-04T21:30:00;Grand Cafe;Muziekavond;Open podium voor muzikanten;https://example.nl;muziek;Muziek,Gratis",
      "Zonder bron;2026-07-01T10:00:00;2026-07-01T12:00:00;Brink;Kort;Lang genoeg;;;;",
    ].join("\n"),
  );

  assert.equal(rows.length, 2);
  assert.equal(rows[0].status, "draft");
  assert.equal(rows[1].status, "draft");
  assert.ok(rows[1].warnings.includes("sourceUrl ontbreekt; standaard bron wordt gebruikt"));
});

test("activity import preview reports invalid date order", () => {
  const rows = parseActivityImportPreview(
    [
      "title;startAt;endAt;locationName;shortDescription;description",
      "Fout;2026-06-04T21:30:00;2026-06-04T19:30:00;Brink;Kort;Lang",
    ].join("\n"),
  );

  assert.equal(rows[0].status, "invalid");
  assert.match(rows[0].errors[0], /Startdatum moet voor einddatum liggen/);
});

test("content maintenance queue tracks known follow-up topics", () => {
  assert.ok(contentMaintenanceQueue.some((item) => item.title.includes("Zuidlaardermarktweek")));
  assert.ok(contentMaintenanceQueue.some((item) => item.title.includes("Open Muziek Podium")));
});
