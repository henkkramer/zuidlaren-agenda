import assert from "node:assert/strict";
import { test } from "node:test";
import { privacyProcessors } from "@/lib/privacy-processors";

test("privacy processor register covers planned MVP processor categories", () => {
  const names = privacyProcessors.map((processor) => processor.name);

  for (const required of ["Hosting en database", "E-mail", "AI-hulp", "Analytics", "Mollie"]) {
    assert.ok(names.includes(required), `Missing privacy processor: ${required}`);
  }
});

test("privacy processor register keeps live and prepared processors explicit", () => {
  assert.ok(privacyProcessors.some((processor) => processor.mvpStatus === "active"));
  assert.ok(privacyProcessors.some((processor) => processor.mvpStatus === "prepared" && processor.name === "Mollie"));

  for (const processor of privacyProcessors) {
    assert.ok(processor.purpose.length > 20, `${processor.name} needs a user-facing purpose`);
  }
});
