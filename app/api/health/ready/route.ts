import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/structured-log";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      ok: true,
      service: "zuidlaren-agenda",
      status: "ready",
      checks: {
        app: "ok",
        database: "ok",
      },
    });
  } catch (error) {
    logError("readiness_database_failed", { error });
    return NextResponse.json(
      {
        ok: false,
        service: "zuidlaren-agenda",
        status: "not_ready",
        checks: {
          app: "ok",
          database: "error",
        },
      },
      { status: 503 },
    );
  }
}
