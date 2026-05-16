import type { Activity } from "@/lib/activity-types";

const productId = "-//Zuidlaren Agenda//Public Calendar//NL";

function escapeIcsText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

function formatIcsDate(value: string) {
  return new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function foldIcsLine(line: string) {
  if (line.length <= 74) return [line];

  const lines: string[] = [];
  let remaining = line;

  while (remaining.length > 74) {
    lines.push(remaining.slice(0, 74));
    remaining = ` ${remaining.slice(74)}`;
  }

  lines.push(remaining);
  return lines;
}

export function buildPublicCalendarFeed(activities: Activity[], now = new Date()) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:${productId}`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Zuidlaren Agenda",
    "X-WR-CALDESC:Publieke activiteiten in en rondom Zuidlaren",
  ];

  for (const activity of activities) {
    const description = [activity.shortDescription, activity.sourceUrl].filter(Boolean).join("\n");
    const location = [activity.locationName, activity.address].filter(Boolean).join(", ");

    lines.push(
      "BEGIN:VEVENT",
      `UID:${escapeIcsText(activity.id)}@zuidlaren-agenda`,
      `DTSTAMP:${formatIcsDate(now.toISOString())}`,
      `DTSTART:${formatIcsDate(activity.startDateTime)}`,
      `DTEND:${formatIcsDate(activity.endDateTime)}`,
      `SUMMARY:${escapeIcsText(activity.title)}`,
      `DESCRIPTION:${escapeIcsText(description)}`,
      `LOCATION:${escapeIcsText(location)}`,
      `URL:${escapeIcsText(activity.sourceUrl)}`,
      "END:VEVENT",
    );
  }

  lines.push("END:VCALENDAR");

  return lines.flatMap(foldIcsLine).join("\r\n");
}
