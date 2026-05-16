import assert from "node:assert/strict";
import { test } from "node:test";
import type { Activity } from "@/lib/activity-types";
import { buildPublicCalendarFeed } from "@/lib/calendar-feed";

const activity: Activity = {
  id: "open-podium",
  title: "Open Podium, Zuidlaren",
  shortDescription: "Muziekavond; lokaal",
  longDescription: "Lokale muziekavond",
  imageUrl: "https://example.nl/image.jpg",
  startDateTime: "2026-06-04T19:30:00.000Z",
  endDateTime: "2026-06-04T21:30:00.000Z",
  locationName: "Grand Cafe Zuidlaren",
  address: "Stationsweg 1",
  category: "muziek",
  typeTags: ["Muziek"],
  organizerName: "Grand Cafe",
  sourceUrl: "https://example.nl/open-podium",
};

test("public calendar feed emits escaped iCalendar events", () => {
  const feed = buildPublicCalendarFeed([activity], new Date("2026-05-16T10:00:00.000Z"));

  assert.match(feed, /^BEGIN:VCALENDAR\r\n/);
  assert.match(feed, /PRODID:-\/\/Zuidlaren Agenda\/\/Public Calendar\/\/NL/);
  assert.match(feed, /UID:open-podium@zuidlaren-agenda/);
  assert.match(feed, /DTSTART:20260604T193000Z/);
  assert.match(feed, /SUMMARY:Open Podium\\, Zuidlaren/);
  assert.match(feed, /DESCRIPTION:Muziekavond\\; lokaal\\nhttps:\/\/example.nl\/open-podium/);
  assert.match(feed, /LOCATION:Grand Cafe Zuidlaren\\, Stationsweg 1/);
  assert.match(feed, /\r\nEND:VCALENDAR$/);
});

test("calendar feed supports custom calendar metadata", () => {
  const feed = buildPublicCalendarFeed([], new Date("2026-05-16T10:00:00.000Z"), {
    description: "Mijn opgeslagen activiteiten",
    name: "Mijn Zuidlaren Agenda",
  });

  assert.match(feed, /X-WR-CALNAME:Mijn Zuidlaren Agenda/);
  assert.match(feed, /X-WR-CALDESC:Mijn opgeslagen activiteiten/);
});

test("calendar feed folds long iCalendar lines", () => {
  const longFeed = buildPublicCalendarFeed([
    {
      ...activity,
      shortDescription:
        "Een zeer lange omschrijving voor calendar clients die regels moeten kunnen parsen zonder dat de iCalendar response te brede regels bevat.",
      title: "Een bijzonder lange activiteitstitel voor contractcontrole in agenda clients",
    },
  ]);

  const lines = longFeed.split("\r\n");

  assert.ok(lines.every((line) => line.length <= 75));
  assert.ok(lines.some((line) => line.startsWith(" ")));
});
