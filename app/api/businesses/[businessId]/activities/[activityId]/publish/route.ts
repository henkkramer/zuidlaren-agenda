import { NextResponse } from "next/server";
import { requireBusinessPermission } from "@/lib/business-permissions";
import { prisma } from "@/lib/prisma";

type PublishContext = {
  params: Promise<{
    businessId: string;
    activityId: string;
  }>;
};

export async function POST(_request: Request, context: PublishContext) {
  const { businessId, activityId } = await context.params;
  const access = await requireBusinessPermission(businessId, "publishActivities");

  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  const activity = await prisma.activity.findFirst({
    where: {
      OR: [{ id: activityId }, { slug: decodeURIComponent(activityId) }],
      businessId: access.business.id,
    },
  });

  if (!activity) {
    return NextResponse.json({ error: "Activiteit niet gevonden" }, { status: 404 });
  }

  const publishedActivity = await prisma.activity.update({
    where: { id: activity.id },
    data: { status: "PUBLISHED" },
  });

  await prisma.auditLog.create({
    data: {
      actorId: access.userId,
      action: "business.activity.publish",
      targetType: "Activity",
      targetId: activity.id,
      metadata: {
        businessId: access.business.id,
      },
    },
  });

  return NextResponse.json({ status: publishedActivity.status.toLowerCase() });
}
