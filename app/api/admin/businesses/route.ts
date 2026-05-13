import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const admin = await requireAdmin();

  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const businesses = await prisma.business.findMany({
    include: {
      _count: {
        select: {
          activities: true,
          members: true,
        },
      },
    },
    orderBy: [{ status: "asc" }, { name: "asc" }],
  });

  return NextResponse.json({ businesses });
}
