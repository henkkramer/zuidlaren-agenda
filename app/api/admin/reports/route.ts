import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { accessDeniedResponse } from "@/lib/route-helpers";

export async function GET() {
  const admin = await requireAdmin();

  if (!admin.ok) {
    return accessDeniedResponse(admin);
  }

  const reports = await prisma.report.findMany({
    include: {
      activity: {
        select: { id: true, slug: true, title: true },
      },
      reporter: {
        select: { id: true, email: true, displayName: true },
      },
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 100,
  });

  return NextResponse.json({ reports });
}
