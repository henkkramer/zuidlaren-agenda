import { NextResponse } from "next/server";
import { createAdminAuditLog, requireAdmin } from "@/lib/admin-auth";
import { parseAdminReportResolution, parseAdminReportStatus } from "@/lib/admin-status-input";
import { rejectCrossOriginMutation } from "@/lib/csrf";
import { prisma } from "@/lib/prisma";
import { accessDeniedResponse, badRequestResponse } from "@/lib/route-helpers";

type ReportContext = {
  params: Promise<{
    reportId: string;
  }>;
};

type ReportPatchPayload = {
  resolution?: unknown;
  status?: unknown;
};

export async function PATCH(request: Request, context: ReportContext) {
  const csrfResponse = rejectCrossOriginMutation(request);
  if (csrfResponse) return csrfResponse;

  const admin = await requireAdmin();

  if (!admin.ok) {
    return accessDeniedResponse(admin);
  }

  const { reportId } = await context.params;
  const payload = ((await request.json().catch(() => null)) ?? {}) as ReportPatchPayload;
  const status = parseAdminReportStatus(payload.status);

  if (!status) {
    return badRequestResponse("Ongeldige rapportstatus");
  }

  const report = await prisma.report.update({
    where: { id: reportId },
    data: {
      status,
      resolution: parseAdminReportResolution(payload.resolution),
    },
  });

  await createAdminAuditLog({
    actorId: admin.userId,
    action: "admin.report.update",
    targetType: "Report",
    targetId: report.id,
    metadata: { status: report.status },
  });

  return NextResponse.json({ report });
}
