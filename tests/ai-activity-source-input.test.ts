import assert from "node:assert/strict";
import { test } from "node:test";
import { parseActivityScanSourceInput } from "@/lib/ai-activity-source-input";

test("scan source input normalizes valid public source settings", () => {
  const parsed = parseActivityScanSourceInput({
    baseUrl: "https://example.nl/agenda",
    kind: "GOVERNMENT",
    name: " Gemeente agenda ",
  });

  assert.equal(parsed.baseUrl, "https://example.nl/agenda");
  assert.equal(parsed.kind, "GOVERNMENT");
  assert.equal(parsed.name, "Gemeente agenda");
  assert.equal(parsed.slug, "gemeente-agenda");
  assert.equal(parsed.enabled, true);
});

test("scan source input rejects non-http URLs", () => {
  assert.throws(() => parseActivityScanSourceInput({ baseUrl: "file:///etc/passwd", name: "Bad" }), /http of https/);
});
