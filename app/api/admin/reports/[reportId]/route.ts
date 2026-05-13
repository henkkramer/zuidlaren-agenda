import { NextResponse } from "next/server";
import { createAdminAuditLog, requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

type ReportContext = {
  params: Promise<{
    reportId: string;
  }>;
};

type ReportPatchPayload = {
  resolution?: unknown;
  status?: unknown;
};

function toReportStatus(value: unknown) {
  if (value === "open") return "OPEN" as const;
  if (value === "reviewed") return "REVIEWED" as const;
  if (value === "dismissed") return "DISMISSED" as const;
  return null;
}

export async function PATCH(request: Request, context: ReportContext) {
  const admin = await requireAdmin();

  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const { reportId } = await context.params;
  const payload = (await request.json()) as ReportPatchPayload;
  const status = toReportStatus(payload.status);

  if (!status) {
    return NextResponse.json({ error: "Ongeldige rapportstatus" }, { status: 400 });
  }

  const report = await prisma.report.update({
    where: { id: reportId },
    data: {
      status,
      resolution: typeof payload.resolution === "string" ? payload.resolution.trim() : undefined,
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
