import assert from "node:assert/strict";
import { test } from "node:test";
import type { Activity } from "@/lib/activity-types";
import { prepareCalendarResponse } from "@/lib/calendar-export";
import { buildPublicCalendarFeed } from "@/lib/calendar-feed";

const fixtureActivity: Activity = {
  id: "zuidlaren-zomeravondmarkt",
  title: "Zuidlaren Zomeravondmarkt",
  shortDescription: "Marktavond op de Brink",
  longDescription: "Lokale markt met muziek en eten.",
  imageUrl: "https://example.nl/zomeravondmarkt.jpg",
  startDateTime: "2026-07-17T17:00:00.000Z",
  endDateTime: "2026-07-17T21:00:00.000Z",
  locationName: "Brink Zuidlaren",
  address: "Brink O.Z.",
  category: "markt",
  typeTags: ["Markt", "Eten"],
  organizerName: "Ondernemend Zuidlaren",
  sourceUrl: "https://example.nl/zuidlaren-zomeravondmarkt",
};

test("calendar fixture runs through feed builder and response preparation", async () => {
  const body = buildPublicCalendarFeed([fixtureActivity], new Date("2026-05-16T08:00:00.000Z"));
  const prepared = prepareCalendarResponse(
    new Request("https://agenda.example.nl/api/public/calendar"),
    { "Cache-Control": "public, max-age=60", "X-Zuidlaren-Api-Version": "2026-05-14" },
    "Zuidlaren Agenda",
    body,
  );

  assert.equal(prepared.notModifiedResponse, null);
  assert.equal(prepared.response.headers.get("content-type"), "text/calendar; charset=utf-8");
  assert.equal(prepared.response.headers.get("content-disposition"), 'inline; filename="zuidlaren-agenda.ics"');
  assert.equal(prepared.response.headers.get("cache-control"), "public, max-age=60");
  assert.equal(prepared.response.headers.get("x-zuidlaren-api-version"), "2026-05-14");
  assert.match(prepared.response.headers.get("etag") ?? "", /^W\/"[a-f0-9]+-\d+"$/);

  const responseBody = await prepared.response.text();
  assert.match(responseBody, /^BEGIN:VCALENDAR\r\n/);
  assert.match(responseBody, /UID:zuidlaren-zomeravondmarkt@zuidlaren-agenda/);
  assert.match(responseBody, /SUMMARY:Zuidlaren Zomeravondmarkt/);
  assert.match(responseBody, /\r\nEND:VCALENDAR$/);
});

test("calendar fixture supports conditional response reuse", () => {
  const body = buildPublicCalendarFeed([fixtureActivity], new Date("2026-05-16T08:00:00.000Z"));
  const first = prepareCalendarResponse(new Request("https://agenda.example.nl/api/public/calendar"), {}, "agenda", body);
  const second = prepareCalendarResponse(
    new Request("https://agenda.example.nl/api/public/calendar", {
      headers: {
        "If-None-Match": first.headers.ETag,
      },
    }),
    {},
    "agenda",
    body,
  );

  assert.equal(second.notModifiedResponse?.status, 304);
  assert.equal(second.notModifiedResponse?.headers.get("etag"), first.headers.ETag);
});
