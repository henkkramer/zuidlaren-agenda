import { NextResponse } from "next/server";
import { createAdminAuditLog, requireAdmin } from "@/lib/admin-auth";
import { rejectCrossOriginMutation } from "@/lib/csrf";
import { prisma } from "@/lib/prisma";

type BusinessContext = {
  params: Promise<{
    businessId: string;
  }>;
};

type BusinessPatchPayload = {
  status?: unknown;
};

function toBusinessStatus(value: unknown) {
  if (value === "pending") return "PENDING" as const;
  if (value === "approved") return "APPROVED" as const;
  if (value === "suspended") return "SUSPENDED" as const;
  return null;
}

export async function PATCH(request: Request, context: BusinessContext) {
  const csrfResponse = rejectCrossOriginMutation(request);
  if (csrfResponse) return csrfResponse;

  const admin = await requireAdmin();

  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const { businessId } = await context.params;
  const payload = (await request.json()) as BusinessPatchPayload;
  const status = toBusinessStatus(payload.status);

  if (!status) {
    return NextResponse.json({ error: "Ongeldige bedrijfsstatus" }, { status: 400 });
  }

  const business = await prisma.business.update({
    where: { id: businessId },
    data: { status },
  });

  await createAdminAuditLog({
    actorId: admin.userId,
    action: "admin.business.status.update",
    targetType: "Business",
    targetId: business.id,
    metadata: { status: business.status },
  });

  return NextResponse.json({ business });
}
