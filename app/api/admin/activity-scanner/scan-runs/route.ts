import { NextResponse } from "next/server";
import { createAdminAuditLog, requireAdmin } from "@/lib/admin-auth";
import { runLocalActivityScan } from "@/lib/ai-activity-scanner";
import { getFailedActivityScanSourceIds } from "@/lib/ai-activity-operations";
import { rejectCrossOriginMutation } from "@/lib/csrf";
import { accessDeniedResponse } from "@/lib/route-helpers";

export async function POST(request: Request) {
  const csrfResponse = rejectCrossOriginMutation(request);
  if (csrfResponse) return csrfResponse;

  const admin = await requireAdmin();

  if (!admin.ok) {
    return accessDeniedResponse(admin);
  }

  const payload = ((await request.json().catch(() => null)) ?? {}) as { mode?: unknown };
  const retryFailedOnly = payload.mode === "failed";
  const sourceIds = retryFailedOnly ? await getFailedActivityScanSourceIds() : undefined;

  if (retryFailedOnly && sourceIds?.length === 0) {
    return NextResponse.json({ summaries: [], message: "Geen mislukte bronnen om opnieuw te proberen" }, { status: 200 });
  }

  const summaries = await runLocalActivityScan(admin.userId, { sourceIds });

  await createAdminAuditLog({
    actorId: admin.userId,
    action: "admin.activity_scan.run",
    targetType: "ActivityScanRun",
    metadata: { retryFailedOnly, summaries },
  });

  return NextResponse.json({ summaries }, { status: 201 });
}
