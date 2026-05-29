import "server-only";

import { summarizeCalendarExportBreakdown, type AnalyticsMetricGroupRow } from "@/lib/analytics-breakdown";
import { prisma } from "@/lib/prisma";

type NotificationDeliveryStatusRow = {
  _count: number;
  status: string;
};

type MetricCountRow = {
  metric: string;
  _sum: { count: number | null };
};

function since(days: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date;
}

export async function getAnalyticsSnapshot() {
  const last30Days = since(30);
  const [
    metricCounts,
    calendarExportBreakdown,
    webVitalBreakdown,
    attendanceCount,
    notificationOptIns,
    aiUsage,
    notificationDeliveries,
    moderationActions,
  ] = await Promise.all([
    prisma.analyticsDailyMetric.groupBy({
      by: ["metric"],
      where: { day: { gte: last30Days } },
      _sum: { count: true },
    }),
    prisma.analyticsDailyMetric.groupBy({
      by: ["dimensionsKey"],
      where: { metric: "calendar_export", day: { gte: last30Days } },
      _sum: { count: true },
    }),
    prisma.analyticsDailyMetric.groupBy({
      by: ["dimensionsKey"],
      where: { metric: "web_vital", day: { gte: last30Days } },
      _sum: { count: true },
    }),
    prisma.attendance.count({ where: { createdAt: { gte: last30Days } } }),
    prisma.notificationPreference.count({
      where: {
        OR: [{ activityReminders: true }, { weeklyDigest: true }, { businessUpdates: true }],
      },
    }),
    prisma.aiUsageLog.aggregate({
      where: { createdAt: { gte: last30Days } },
      _count: true,
      _sum: { costCents: true },
    }),
    prisma.notificationDelivery.groupBy({
      by: ["status"],
      where: { createdAt: { gte: last30Days } },
      _count: true,
    }),
    prisma.auditLog.count({
      where: {
        createdAt: { gte: last30Days },
        OR: [
          { action: { startsWith: "admin." } },
          { action: { contains: ".approve" } },
          { action: { contains: ".review" } },
          { action: { contains: ".unpublish" } },
        ],
      },
    }),
  ]);

  const metricCountMap = new Map(
    (metricCounts as MetricCountRow[]).map((row) => [row.metric, row._sum.count ?? 0]),
  );

  return {
    windowDays: 30,
    activityViews: metricCountMap.get("activity_view") ?? 0,
    sourceClicks: metricCountMap.get("activity_source_click") ?? 0,
    attendanceClicks: metricCountMap.get("attendance_click") ?? 0,
    filterUses: metricCountMap.get("filter_use") ?? 0,
    publicActivityLists: metricCountMap.get("public_activity_list") ?? 0,
    calendarExports: metricCountMap.get("calendar_export") ?? 0,
    webVitals: metricCountMap.get("web_vital") ?? 0,
    webVitalBreakdown: summarizeCalendarExportBreakdown(webVitalBreakdown as AnalyticsMetricGroupRow[]).slice(0, 5),
    calendarExportBreakdown: summarizeCalendarExportBreakdown(calendarExportBreakdown as AnalyticsMetricGroupRow[]),
    attendanceCount,
    notificationOptIns,
    aiUsageCount: aiUsage._count,
    aiCostCents: aiUsage._sum.costCents ?? 0,
    notificationDeliveries: (notificationDeliveries as NotificationDeliveryStatusRow[]).map((row) => ({
      status: row.status.toLowerCase(),
      count: row._count,
    })),
    moderationActions,
  };
}
