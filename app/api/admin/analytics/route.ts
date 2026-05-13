import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getAnalyticsSnapshot } from "@/lib/analytics-snapshot";

export async function GET() {
  const admin = await requireAdmin();

  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  return NextResponse.json(await getAnalyticsSnapshot());
}
