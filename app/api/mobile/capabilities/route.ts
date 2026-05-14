import { NextResponse } from "next/server";
import { buildMobileCapabilities } from "@/lib/mobile-contracts";

export async function GET() {
  return NextResponse.json(buildMobileCapabilities(), {
    headers: {
      "Cache-Control": "public, max-age=300",
    },
  });
}
