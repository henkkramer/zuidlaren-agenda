import { NextResponse } from "next/server";
import { createAdminAuditLog, requireAdmin } from "@/lib/admin-auth";
import { parseActivityScanSourceInput } from "@/lib/ai-activity-source-input";
import { rejectCrossOriginMutation } from "@/lib/csrf";
import { prisma } from "@/lib/prisma";
import { accessDeniedResponse, badRequestResponse } from "@/lib/route-helpers";

type SourceContext = {
  params: Promise<{
    sourceId: string;
  }>;
};

type SourcePatchPayload = {
  baseUrl?: unknown;
  enabled?: unknown;
  kind?: unknown;
  name?: unknown;
  respectRobots?: unknown;
  slug?: unknown;
};

export async function PATCH(request: Request, context: SourceContext) {
  const csrfResponse = rejectCrossOriginMutation(request);
  if (csrfResponse) return csrfResponse;

  const admin = await requireAdmin();

  if (!admin.ok) {
    return accessDeniedResponse(admin);
  }

  const { sourceId } = await context.params;
  const payload = ((await request.json().catch(() => null)) ?? {}) as SourcePatchPayload;

  try {
    const existing = await prisma.activityScanSource.findUnique({ where: { id: sourceId } });

    if (!existing) {
      return badRequestResponse("Scanbron niet gevonden");
    }

    const parsed = parseActivityScanSourceInput({
      baseUrl: payload.baseUrl ?? existing.baseUrl,
      enabled: payload.enabled ?? existing.enabled,
      kind: payload.kind ?? existing.kind,
      name: payload.name ?? existing.name,
      respectRobots: payload.respectRobots ?? existing.respectRobots,
      slug: payload.slug ?? existing.slug,
    });

    const source = await prisma.activityScanSource.update({
      where: { id: sourceId },
      data: parsed,
    });

    await createAdminAuditLog({
      actorId: admin.userId,
      action: "admin.activity_scan_source.update",
      targetType: "ActivityScanSource",
      targetId: source.id,
      metadata: { enabled: source.enabled, kind: source.kind, slug: source.slug },
    });

    return NextResponse.json({ source });
  } catch (error) {
    return badRequestResponse(error instanceof Error ? error.message : "Scanbron kon niet worden bijgewerkt");
  }
}
