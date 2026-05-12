import type { Activity } from "@/lib/activity-types";
import { activityDateParts } from "@/lib/date-format";

export function ActivityDateBadge({ activity }: { activity: Activity }) {
  const parts = activityDateParts(activity);

  return (
    <div className="date-badge" aria-label={`${parts.longDate}, ${parts.time}`}>
      <span className="dayname">{parts.dayName}</span>
      <span className="day">{parts.day}</span>
      <span className="month">{parts.month}</span>
      <span className="time">{parts.time}</span>
    </div>
  );
}
