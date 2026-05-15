import assert from "node:assert/strict";
import { test } from "node:test";
import { parseProfileInput } from "@/lib/profile-input";

test("profile input trims display name and keeps valid locale", () => {
  assert.deepEqual(
    parseProfileInput({
      deletionRequested: false,
      displayName: "  Tester  ",
      locale: "en-US",
    }),
    {
      deletionRequested: false,
      displayName: "Tester",
      locale: "en-US",
    },
  );
});

test("profile input records deletion request only for explicit true", () => {
  assert.equal(parseProfileInput({ displayName: "Tester", deletionRequested: true }).deletionRequested, true);
  assert.equal(parseProfileInput({ displayName: "Tester", deletionRequested: "true" }).deletionRequested, false);
  assert.equal(parseProfileInput({ displayName: "Tester" }).deletionRequested, false);
});

test("profile input falls back to Dutch locale", () => {
  assert.equal(parseProfileInput({ displayName: "Tester", locale: "de-DE" }).locale, "nl-NL");
  assert.equal(parseProfileInput({ displayName: "Tester" }).locale, "nl-NL");
});

test("profile input rejects invalid display names", () => {
  assert.throws(() => parseProfileInput({ displayName: " A " }), /Naam moet 2 tot 80 tekens zijn/);
  assert.throws(() => parseProfileInput({ displayName: "x".repeat(81) }), /Naam moet 2 tot 80 tekens zijn/);
  assert.throws(() => parseProfileInput({}), /Naam moet 2 tot 80 tekens zijn/);
});
