import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { accessDeniedResponse } from "@/lib/route-helpers";

export async function GET() {
  const admin = await requireAdmin();

  if (!admin.ok) {
    return accessDeniedResponse(admin);
  }

  const activities = await prisma.activity.findMany({
    include: {
      business: true,
      category: true,
      location: true,
    },
    orderBy: { startAt: "asc" },
    take: 200,
  });

  return NextResponse.json({ activities });
}
