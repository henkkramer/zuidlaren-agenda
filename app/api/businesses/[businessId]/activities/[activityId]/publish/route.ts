import { NextResponse } from "next/server";
import { requireBusinessPermission } from "@/lib/business-permissions";
import { rejectCrossOriginMutation } from "@/lib/csrf";
import { prisma } from "@/lib/prisma";
import { revalidatePublicActivityCaches } from "@/lib/public-activity-cache";
import { accessDeniedResponse } from "@/lib/route-helpers";

type PublishContext = {
  params: Promise<{
    businessId: string;
    activityId: string;
  }>;
};

export async function POST(request: Request, context: PublishContext) {
  const csrfResponse = rejectCrossOriginMutation(request);
  if (csrfResponse) return csrfResponse;

  const { businessId, activityId } = await context.params;
  const access = await requireBusinessPermission(businessId, "publishActivities");

  if (!access.ok) {
    return accessDeniedResponse(access);
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

  revalidatePublicActivityCaches({ filterOptions: true });

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
