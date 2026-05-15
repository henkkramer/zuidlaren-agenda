import assert from "node:assert/strict";
import { test } from "node:test";
import { parseNotificationPreferencesInput, parseNotificationSlugList } from "@/lib/notification-preferences-input";

test("notification preference input keeps only explicit boolean opt-ins", () => {
  assert.deepEqual(
    parseNotificationPreferencesInput({
      activityReminders: true,
      businessUpdates: "true",
      weeklyDigest: false,
    }),
    {
      activityReminders: true,
      businessUpdates: false,
      categorySlugs: [],
      locationSlugs: [],
      weeklyDigest: false,
    },
  );
});

test("notification slug list trims deduplicates validates and caps values", () => {
  const many = Array.from({ length: 30 }, (_, index) => `slug-${index}`);
  const parsed = parseNotificationSlugList([" markt ", "markt", "muziek", "Upper", "bad slug", "x".repeat(61), ...many]);

  assert.equal(parsed[0], "markt");
  assert.equal(parsed[1], "muziek");
  assert.equal(parsed.includes("Upper"), false);
  assert.equal(parsed.includes("bad slug"), false);
  assert.equal(parsed.length, 20);
});

test("notification preference input sanitizes category and location slugs", () => {
  assert.deepEqual(
    parseNotificationPreferencesInput({
      categorySlugs: ["markt", "bad slug", "muziek"],
      locationSlugs: ["centrum", "centrum", "noord_1"],
    }),
    {
      activityReminders: false,
      businessUpdates: false,
      categorySlugs: ["markt", "muziek"],
      locationSlugs: ["centrum", "noord_1"],
      weeklyDigest: false,
    },
  );
});
