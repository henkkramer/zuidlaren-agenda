import type { Activity, ActivityCategory } from "@/lib/activity-types";

type ActivityRecord = {
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  imageUrl: string;
  startAt: Date;
  endAt: Date;
  location: {
    name: string;
    address: string | null;
  };
  category: {
    slug: string;
  };
  typeTags: string[];
  organizerName: string;
  sourceUrl: string;
  indoorOutdoor: string | null;
  expectedVisitors: string | null;
  sourceQuality: string | null;
};

function toActivityCategory(slug: string): ActivityCategory {
  const allowedCategories: ActivityCategory[] = ["cultuur", "muziek", "sport", "markt", "kinderen", "eten_drinken", "natuur"];

  if (allowedCategories.includes(slug as ActivityCategory)) {
    return slug as ActivityCategory;
  }

  return "cultuur";
}

function toIndoorOutdoor(value: string | null): Activity["indoorOutdoor"] {
  if (value === "Binnen" || value === "Buiten" || value === "Gemengd") {
    return value;
  }

  return undefined;
}

export function mapActivityRecord(activity: ActivityRecord): Activity {
  return {
    id: activity.slug,
    title: activity.title,
    shortDescription: activity.shortDescription,
    longDescription: activity.description,
    imageUrl: activity.imageUrl,
    startDateTime: activity.startAt.toISOString(),
    endDateTime: activity.endAt.toISOString(),
    locationName: activity.location.name,
    address: activity.location.address ?? undefined,
    category: toActivityCategory(activity.category.slug),
    typeTags: activity.typeTags,
    organizerName: activity.organizerName,
    sourceUrl: activity.sourceUrl,
    indoorOutdoor: toIndoorOutdoor(activity.indoorOutdoor),
    expectedVisitors: activity.expectedVisitors ?? undefined,
    sourceQuality: activity.sourceQuality ?? undefined,
  };
}
