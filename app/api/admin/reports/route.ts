import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { pageResult, parseCursorPagination } from "@/lib/public-activity-pagination";
import { accessDeniedResponse } from "@/lib/route-helpers";

export async function GET(request: NextRequest) {
  const admin = await requireAdmin();

  if (!admin.ok) {
    return accessDeniedResponse(admin);
  }

  const pagination = parseCursorPagination(request.nextUrl.searchParams, { defaultLimit: 50, maxLimit: 100 });
  const cursor = pagination.cursor ? { id: decodeURIComponent(pagination.cursor) } : undefined;
  const rows = await prisma.report.findMany({
    cursor,
    skip: cursor ? 1 : undefined,
    select: {
      id: true,
      reason: true,
      details: true,
      status: true,
      resolution: true,
      createdAt: true,
      updatedAt: true,
      activity: {
        select: { id: true, slug: true, title: true },
      },
      reporter: {
        select: { id: true, email: true, displayName: true },
      },
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }, { id: "asc" }],
    take: pagination.limit + 1,
  });
  const page = pageResult(rows, pagination.limit);

  return NextResponse.json({ reports: page.items, nextCursor: page.nextCursor, hasMore: page.hasMore, limit: pagination.limit });
}
