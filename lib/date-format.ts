import type { Activity } from "@/lib/activity-types";

export function activityDateParts(activity: Activity) {
  const date = new Date(activity.startDateTime);

  return {
    dayName: new Intl.DateTimeFormat("nl-NL", { weekday: "short" }).format(date).replace(".", ""),
    day: new Intl.DateTimeFormat("nl-NL", { day: "2-digit" }).format(date),
    month: new Intl.DateTimeFormat("nl-NL", { month: "short" }).format(date).replace(".", ""),
    time: new Intl.DateTimeFormat("nl-NL", { hour: "2-digit", minute: "2-digit" }).format(date),
    longDate: new Intl.DateTimeFormat("nl-NL", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(date)
  };
}

export function formatActivityEndTime(activity: Activity) {
  return new Intl.DateTimeFormat("nl-NL", { hour: "2-digit", minute: "2-digit" }).format(new Date(activity.endDateTime));
}
