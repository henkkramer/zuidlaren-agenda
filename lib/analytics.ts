import "server-only";

import { prisma } from "@/lib/prisma";
import { logWarn } from "@/lib/structured-log";

export type AnalyticsMetric =
  | "activity_view"
  | "activity_source_click"
  | "attendance_click"
  | "calendar_export"
  | "filter_use"
  | "public_activity_list"
  | "web_vital";

type AnalyticsInput = {
  metric: AnalyticsMetric;
  activityId?: string;
  category?: string;
  location?: string;
  dimensions?: Record<string, string | number | boolean | undefined>;
};

function dayStart(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function safeDimension(value: string | number | boolean | undefined) {
  if (value === undefined) {
    return undefined;
  }

  return String(value).replace(/[^a-zA-Z0-9_.:-]/g, "_").slice(0, 80);
}

function dimensionsKey(input: AnalyticsInput) {
  const dimensions = {
    ...(input.activityId ? { activityId: input.activityId } : {}),
    ...(input.category ? { category: input.category } : {}),
    ...(input.location ? { location: input.location } : {}),
    ...(input.dimensions ?? {}),
  };
  const parts = Object.entries(dimensions)
    .map(([key, value]) => [key, safeDimension(value)] as const)
    .filter((entry): entry is readonly [string, string] => Boolean(entry[1]))
    .sort(([left], [right]) => left.localeCompare(right));

  return parts.length ? parts.map(([key, value]) => `${key}:${value}`).join("|").slice(0, 500) : "global";
}

export async function recordAnalyticsMetric(input: AnalyticsInput) {
  const day = dayStart();
  const key = dimensionsKey(input);

  try {
    await prisma.analyticsDailyMetric.upsert({
      where: {
        day_metric_dimensionsKey: {
          day,
          metric: input.metric,
          dimensionsKey: key,
        },
      },
      update: {
        count: { increment: 1 },
        activityId: input.activityId,
        category: input.category,
        location: input.location,
      },
      create: {
        day,
        metric: input.metric,
        dimensionsKey: key,
        activityId: input.activityId,
        category: input.category,
        location: input.location,
        count: 1,
      },
    });
  } catch (error) {
    logWarn("analytics_record_failed", {
      error,
      metric: input.metric,
    });
  }
}

export function hasActiveFilterDimensions(filters: Record<string, unknown>) {
  return Object.entries(filters).some(([key, value]) => key !== "limit" && value !== undefined && value !== false && value !== "");
}
