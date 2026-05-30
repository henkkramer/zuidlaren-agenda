import assert from "node:assert/strict";
import { test } from "node:test";
import { fetchActivityScanSource } from "@/lib/ai-activity-source-fetcher";

test("source fetcher rejects local URLs before fetching", async () => {
  const result = await fetchActivityScanSource("http://127.0.0.1:3000/admin");

  assert.equal(result.status, null);
  assert.equal(result.bytesFetched, 0);
  assert.match(result.error ?? "", /niet toegestaan/);
});
