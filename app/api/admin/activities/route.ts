import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { adminActivityListSelect } from "@/lib/prisma-selects";
import { pageResult, parseCursorPagination } from "@/lib/public-activity-pagination";
import { accessDeniedResponse } from "@/lib/route-helpers";

export async function GET(request: NextRequest) {
  const admin = await requireAdmin();

  if (!admin.ok) {
    return accessDeniedResponse(admin);
  }

  const pagination = parseCursorPagination(request.nextUrl.searchParams, { defaultLimit: 50, maxLimit: 200 });
  const cursor = pagination.cursor ? { id: decodeURIComponent(pagination.cursor) } : undefined;
  const rows = await prisma.activity.findMany({
    cursor,
    skip: cursor ? 1 : undefined,
    select: adminActivityListSelect,
    orderBy: [{ startAt: "asc" }, { id: "asc" }],
    take: pagination.limit + 1,
  });
  const page = pageResult(rows, pagination.limit);

  return NextResponse.json({ activities: page.items, nextCursor: page.nextCursor, hasMore: page.hasMore, limit: pagination.limit });
}
