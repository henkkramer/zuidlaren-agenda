import { NextResponse } from "next/server";
import { createAdminAuditLog, requireAdmin } from "@/lib/admin-auth";
import { runLocalActivityScan } from "@/lib/ai-activity-scanner";
import { rejectCrossOriginMutation } from "@/lib/csrf";
import { accessDeniedResponse } from "@/lib/route-helpers";

export async function POST(request: Request) {
  const csrfResponse = rejectCrossOriginMutation(request);
  if (csrfResponse) return csrfResponse;

  const admin = await requireAdmin();

  if (!admin.ok) {
    return accessDeniedResponse(admin);
  }

  const summaries = await runLocalActivityScan(admin.userId);

  await createAdminAuditLog({
    actorId: admin.userId,
    action: "admin.activity_scan.run",
    targetType: "ActivityScanRun",
    metadata: { summaries },
  });

  return NextResponse.json({ summaries }, { status: 201 });
}
