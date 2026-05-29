import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getAnalyticsSnapshot } from "@/lib/analytics-snapshot";
import { accessDeniedResponse } from "@/lib/route-helpers";

export async function GET() {
  const admin = await requireAdmin();

  if (!admin.ok) {
    return accessDeniedResponse(admin);
  }

  return NextResponse.json(await getAnalyticsSnapshot());
}
