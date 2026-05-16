import assert from "node:assert/strict";
import { test } from "node:test";
import { calendarAttachmentHeader, calendarRateLimitKey, sanitizeCalendarFilename } from "@/lib/calendar-export";

test("calendar filenames are ascii-safe and bounded", () => {
  assert.equal(sanitizeCalendarFilename("Muziekavond: Café & Markt / Zuidlaren"), "muziekavond-cafe-markt-zuidlaren");
  assert.equal(sanitizeCalendarFilename("   "), "zuidlaren-agenda");
  assert.equal(sanitizeCalendarFilename("a".repeat(120)).length, 80);
});

test("calendar attachment header uses sanitized ics filename", () => {
  assert.equal(calendarAttachmentHeader("Open Podium; test"), 'inline; filename="open-podium-test.ics"');
});

test("calendar rate limit keys avoid raw user input in public scope", () => {
  const request = new Request("https://example.nl/api/public/calendar", {
    headers: {
      "x-forwarded-for": "203.0.113.10, 10.0.0.1",
    },
  });

  assert.equal(calendarRateLimitKey(request, "public-feed"), "calendar:public-feed:ip:203.0.113.10");
  assert.equal(calendarRateLimitKey(request, "personal-agenda", "user-1"), "calendar:personal-agenda:user:user-1");
});
