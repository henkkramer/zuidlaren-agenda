import assert from "node:assert/strict";
import { test } from "node:test";
import {
  calendarAttachmentHeader,
  calendarEtag,
  calendarNotModifiedResponse,
  calendarRateLimitKey,
  calendarResponseHeaders,
  sanitizeCalendarFilename,
} from "@/lib/calendar-export";

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

test("calendar response headers include stable weak etags", () => {
  const headers = calendarResponseHeaders({ "X-Zuidlaren-Api-Version": "2026-05-14" }, "Open Podium", "BEGIN:VCALENDAR");

  assert.equal(headers["Content-Disposition"], 'inline; filename="open-podium.ics"');
  assert.equal(headers["Content-Type"], "text/calendar; charset=utf-8");
  assert.equal(headers.ETag, calendarEtag("BEGIN:VCALENDAR"));
  assert.match(headers.ETag, /^W\/"[a-f0-9]+-\d+"$/);
});

test("calendar conditional request returns not modified on matching etag", () => {
  const headers = calendarResponseHeaders({}, "agenda", "BEGIN:VCALENDAR");
  const request = new Request("https://example.nl/api/public/calendar", {
    headers: {
      "if-none-match": `"ignored", ${headers.ETag}`,
    },
  });

  const response = calendarNotModifiedResponse(request, headers);

  assert.equal(response?.status, 304);
  assert.equal(response?.headers.get("etag"), headers.ETag);
  assert.equal(calendarNotModifiedResponse(new Request("https://example.nl"), headers), null);
});
