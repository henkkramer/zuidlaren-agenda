import { NextResponse } from "next/server";
import { requireBusinessPermission } from "@/lib/business-permissions";
import { rejectCrossOriginMutation } from "@/lib/csrf";
import { prisma } from "@/lib/prisma";
import { accessDeniedResponse } from "@/lib/route-helpers";

type UnpublishContext = {
  params: Promise<{
    businessId: string;
    activityId: string;
  }>;
};

export async function POST(request: Request, context: UnpublishContext) {
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

  const unpublishedActivity = await prisma.activity.update({
    where: { id: activity.id },
    data: { status: "UNPUBLISHED" },
  });

  await prisma.auditLog.create({
    data: {
      actorId: access.userId,
      action: "business.activity.unpublish",
      targetType: "Activity",
      targetId: activity.id,
      metadata: {
        businessId: access.business.id,
      },
    },
  });

  return NextResponse.json({ status: unpublishedActivity.status.toLowerCase() });
}
