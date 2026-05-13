import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getBillingSummary } from "@/lib/billing-summary";

export async function GET() {
  const admin = await requireAdmin();

  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  return NextResponse.json(await getBillingSummary());
}
