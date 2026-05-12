import { NextResponse } from "next/server";

export function GET() {
  // Database readiness is added once Prisma/PostgreSQL are wired in Sprint 4.
  return NextResponse.json({
    ok: true,
    service: "zuidlaren-agenda",
    status: "ready",
    checks: {
      app: "ok",
      database: "not_configured_yet"
    }
  });
}
