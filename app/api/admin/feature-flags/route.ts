import { NextResponse } from "next/server";
import { createAdminAuditLog, requireAdmin } from "@/lib/admin-auth";
import { rejectCrossOriginMutation } from "@/lib/csrf";
import { prisma } from "@/lib/prisma";
import { accessDeniedResponse, badRequestResponse } from "@/lib/route-helpers";

type FeatureFlagPayload = {
  enabled?: unknown;
  key?: unknown;
};

export async function GET() {
  const admin = await requireAdmin();

  if (!admin.ok) {
    return accessDeniedResponse(admin);
  }

  const featureFlags = await prisma.featureFlag.findMany({
    orderBy: { key: "asc" },
  });

  return NextResponse.json({ featureFlags });
}

export async function PATCH(request: Request) {
  const csrfResponse = rejectCrossOriginMutation(request);
  if (csrfResponse) return csrfResponse;

  const admin = await requireAdmin();

  if (!admin.ok) {
    return accessDeniedResponse(admin);
  }

  const payload = (await request.json()) as FeatureFlagPayload;
  const key = typeof payload.key === "string" ? payload.key.trim() : "";

  if (!key || typeof payload.enabled !== "boolean") {
    return badRequestResponse("Feature flag key en enabled zijn verplicht");
  }

  const featureFlag = await prisma.featureFlag.upsert({
    where: { key },
    update: { enabled: payload.enabled },
    create: { key, enabled: payload.enabled, description: "Admin-created feature flag." },
  });

  await createAdminAuditLog({
    actorId: admin.userId,
    action: "admin.feature_flag.update",
    targetType: "FeatureFlag",
    targetId: featureFlag.id,
    metadata: { key: featureFlag.key, enabled: featureFlag.enabled },
  });

  return NextResponse.json({ featureFlag });
}
