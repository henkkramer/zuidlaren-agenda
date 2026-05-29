import { NextResponse } from "next/server";
import { createAdminAuditLog, requireAdmin } from "@/lib/admin-auth";
import { parseAdminActivityStatus } from "@/lib/admin-status-input";
import { rejectCrossOriginMutation } from "@/lib/csrf";
import { prisma } from "@/lib/prisma";
import { revalidatePublicActivityCaches } from "@/lib/public-activity-cache";
import { accessDeniedResponse, badRequestResponse } from "@/lib/route-helpers";

type ActivityContext = {
  params: Promise<{
    activityId: string;
  }>;
};

type ActivityPatchPayload = {
  status?: unknown;
};

export async function PATCH(request: Request, context: ActivityContext) {
  const csrfResponse = rejectCrossOriginMutation(request);
  if (csrfResponse) return csrfResponse;

  const admin = await requireAdmin();

  if (!admin.ok) {
    return accessDeniedResponse(admin);
  }

  const { activityId } = await context.params;
  const payload = ((await request.json().catch(() => null)) ?? {}) as ActivityPatchPayload;
  const status = parseAdminActivityStatus(payload.status);

  if (!status) {
    return badRequestResponse("Ongeldige activiteitstatus");
  }

  const activity = await prisma.activity.update({
    where: { id: activityId },
    data: { status },
  });

  revalidatePublicActivityCaches({ filterOptions: true });

  await createAdminAuditLog({
    actorId: admin.userId,
    action: "admin.activity.status.update",
    targetType: "Activity",
    targetId: activity.id,
    metadata: { status: activity.status },
  });

  return NextResponse.json({ activity });
}
