import { NextResponse, after } from "next/server";
import { recordAnalyticsMetric, type AnalyticsMetric } from "@/lib/analytics";
import { prisma } from "@/lib/prisma";

type AnalyticsEventPayload = {
  event?: unknown;
  activityId?: unknown;
};

const publicEvents: Record<string, AnalyticsMetric> = {
  activity_view: "activity_view",
  activity_source_click: "activity_source_click",
};

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as AnalyticsEventPayload | null;
  const metric = typeof payload?.event === "string" ? publicEvents[payload.event] : undefined;
  const activitySlug = typeof payload?.activityId === "string" ? payload.activityId.slice(0, 120) : "";

  if (!metric || !activitySlug) {
    return NextResponse.json({ error: "Ongeldige analytics gebeurtenis" }, { status: 400 });
  }

  const activity = await prisma.activity.findUnique({
    where: { slug: activitySlug },
    include: {
      category: true,
      location: true,
    },
  });

  if (!activity || activity.status !== "PUBLISHED") {
    return NextResponse.json({ ok: true });
  }

  after(() =>
    recordAnalyticsMetric({
      metric,
      activityId: activity.id,
      category: activity.category.slug,
      location: activity.location.slug,
    }),
  );

  return NextResponse.json({ ok: true });
}
