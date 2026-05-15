import { NextResponse } from "next/server";
import { createAdminAuditLog, requireAdmin } from "@/lib/admin-auth";
import { rejectCrossOriginMutation } from "@/lib/csrf";
import { prisma } from "@/lib/prisma";

type FeatureFlagPayload = {
  enabled?: unknown;
  key?: unknown;
};

export async function GET() {
  const admin = await requireAdmin();

  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
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
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const payload = (await request.json()) as FeatureFlagPayload;
  const key = typeof payload.key === "string" ? payload.key.trim() : "";

  if (!key || typeof payload.enabled !== "boolean") {
    return NextResponse.json({ error: "Feature flag key en enabled zijn verplicht" }, { status: 400 });
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
