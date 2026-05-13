import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    console.error(
      JSON.stringify({
        level: "error",
        event: "readiness_database_failed",
        message: error instanceof Error ? error.message : "unknown",
      }),
    );
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
