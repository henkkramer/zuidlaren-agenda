import { NextResponse } from "next/server";
import { createAdminAuditLog, requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

type ActivityContext = {
  params: Promise<{
    activityId: string;
  }>;
};

type ActivityPatchPayload = {
  status?: unknown;
};

function toActivityStatus(value: unknown) {
  if (value === "draft") return "DRAFT" as const;
  if (value === "scheduled") return "SCHEDULED" as const;
  if (value === "published") return "PUBLISHED" as const;
  if (value === "unpublished") return "UNPUBLISHED" as const;
  if (value === "expired") return "EXPIRED" as const;
  return null;
}

export async function PATCH(request: Request, context: ActivityContext) {
  const admin = await requireAdmin();

  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const { activityId } = await context.params;
  const payload = (await request.json()) as ActivityPatchPayload;
  const status = toActivityStatus(payload.status);

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
