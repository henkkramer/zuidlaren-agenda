import "server-only";

import { summarizeCalendarExportBreakdown, type AnalyticsMetricGroupRow } from "@/lib/analytics-breakdown";
import { prisma } from "@/lib/prisma";

type NotificationDeliveryStatusRow = {
  _count: number;
  status: string;
};

function since(days: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date;
}

export async function getAnalyticsSnapshot() {
  const last30Days = since(30);
  const [
    activityViews,
    sourceClicks,
    attendanceClicks,
    filterUses,
    calendarExports,
    calendarExportBreakdown,
    attendanceCount,
    notificationOptIns,
    aiUsage,
    notificationDeliveries,
    moderationActions,
  ] = await Promise.all([
    prisma.analyticsDailyMetric.aggregate({
      where: { metric: "activity_view", day: { gte: last30Days } },
      _sum: { count: true },
    }),
    prisma.analyticsDailyMetric.aggregate({
      where: { metric: "activity_source_click", day: { gte: last30Days } },
      _sum: { count: true },
    }),
    prisma.analyticsDailyMetric.aggregate({
      where: { metric: "attendance_click", day: { gte: last30Days } },
      _sum: { count: true },
    }),
    prisma.analyticsDailyMetric.aggregate({
      where: { metric: "filter_use", day: { gte: last30Days } },
      _sum: { count: true },
    }),
    prisma.analyticsDailyMetric.aggregate({
      where: { metric: "calendar_export", day: { gte: last30Days } },
      _sum: { count: true },
    }),
    prisma.analyticsDailyMetric.groupBy({
      by: ["dimensionsKey"],
      where: { metric: "calendar_export", day: { gte: last30Days } },
      _sum: { count: true },
    }),
    prisma.attendance.count(),
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

  return {
    windowDays: 30,
    activityViews: activityViews._sum.count ?? 0,
    sourceClicks: sourceClicks._sum.count ?? 0,
    attendanceClicks: attendanceClicks._sum.count ?? 0,
    filterUses: filterUses._sum.count ?? 0,
    calendarExports: calendarExports._sum.count ?? 0,
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
