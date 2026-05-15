import { NextResponse } from "next/server";
import { createAdminAuditLog, requireAdmin } from "@/lib/admin-auth";
import { parseAdminActivityStatus } from "@/lib/admin-status-input";
import { rejectCrossOriginMutation } from "@/lib/csrf";
import { prisma } from "@/lib/prisma";

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
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const { activityId } = await context.params;
  const payload = ((await request.json().catch(() => null)) ?? {}) as ActivityPatchPayload;
  const status = parseAdminActivityStatus(payload.status);

  if (!status) {
    return NextResponse.json({ error: "Ongeldige activiteitstatus" }, { status: 400 });
  }

  const activity = await prisma.activity.update({
    where: { id: activityId },
    data: { status },
  });

  await createAdminAuditLog({
    actorId: admin.userId,
    action: "admin.activity.status.update",
    targetType: "Activity",
    targetId: activity.id,
    metadata: { status: activity.status },
  });

  return NextResponse.json({ activity });
}
