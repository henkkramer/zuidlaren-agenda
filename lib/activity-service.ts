import type { Activity } from "@/lib/activity-types";
import { mockActivities } from "@/lib/mock-activities";

export type ActivityFeedQuery = {
  limit?: number;
};

export function getPublicActivities(query: ActivityFeedQuery = {}): Activity[] {
  const sortedActivities = [...mockActivities].sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime());

  if (query.limit) {
    return sortedActivities.slice(0, query.limit);
  }

  return sortedActivities;
}
