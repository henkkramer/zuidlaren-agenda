import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getBillingSummary } from "@/lib/billing-summary";
import { accessDeniedResponse } from "@/lib/route-helpers";

export async function GET() {
  const admin = await requireAdmin();

  if (!admin.ok) {
    return accessDeniedResponse(admin);
  }

  return NextResponse.json(await getBillingSummary());
}
