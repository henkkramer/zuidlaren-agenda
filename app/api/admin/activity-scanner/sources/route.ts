import { NextResponse } from "next/server";
import { createAdminAuditLog, requireAdmin } from "@/lib/admin-auth";
import { parseActivityScanSourceInput } from "@/lib/ai-activity-source-input";
import { rejectCrossOriginMutation } from "@/lib/csrf";
import { prisma } from "@/lib/prisma";
import { accessDeniedResponse, badRequestResponse } from "@/lib/route-helpers";

export async function GET() {
  const admin = await requireAdmin();

  if (!admin.ok) {
    return accessDeniedResponse(admin);
  }

  const sources = await prisma.activityScanSource.findMany({
    orderBy: [{ enabled: "desc" }, { name: "asc" }],
  });

  return NextResponse.json({ sources });
}

export async function POST(request: Request) {
  const csrfResponse = rejectCrossOriginMutation(request);
  if (csrfResponse) return csrfResponse;

  const admin = await requireAdmin();

  if (!admin.ok) {
    return accessDeniedResponse(admin);
  }

  try {
    const parsed = parseActivityScanSourceInput((await request.json().catch(() => null)) ?? {});
    const source = await prisma.activityScanSource.create({ data: parsed });

    await createAdminAuditLog({
      actorId: admin.userId,
      action: "admin.activity_scan_source.create",
      targetType: "ActivityScanSource",
      targetId: source.id,
      metadata: { baseUrl: source.baseUrl, kind: source.kind, slug: source.slug },
    });

    return NextResponse.json({ source }, { status: 201 });
  } catch (error) {
    return badRequestResponse(error instanceof Error ? error.message : "Scanbron kon niet worden aangemaakt");
  }
}
