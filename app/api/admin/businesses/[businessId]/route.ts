import { NextResponse } from "next/server";
import { createAdminAuditLog, requireAdmin } from "@/lib/admin-auth";
import { parseAdminBusinessStatus } from "@/lib/admin-status-input";
import { rejectCrossOriginMutation } from "@/lib/csrf";
import { prisma } from "@/lib/prisma";
import { accessDeniedResponse, badRequestResponse } from "@/lib/route-helpers";

type BusinessContext = {
  params: Promise<{
    businessId: string;
  }>;
};

type BusinessPatchPayload = {
  status?: unknown;
};

export async function PATCH(request: Request, context: BusinessContext) {
  const csrfResponse = rejectCrossOriginMutation(request);
  if (csrfResponse) return csrfResponse;

  const admin = await requireAdmin();

  if (!admin.ok) {
    return accessDeniedResponse(admin);
  }

  const { businessId } = await context.params;
  const payload = ((await request.json().catch(() => null)) ?? {}) as BusinessPatchPayload;
  const status = parseAdminBusinessStatus(payload.status);

  if (!status) {
    return badRequestResponse("Ongeldige bedrijfsstatus");
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
