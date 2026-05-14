import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type CheckState = "ok" | "missing" | "warning" | "error";

function envCheck(name: string) {
  return process.env[name] ? "ok" : "missing";
}

export async function GET() {
  const checks: Record<string, CheckState | number> = {
    database: "error",
    publishedActivities: 0,
    categories: 0,
    locations: 0,
    adminUsers: 0,
    databaseUrl: envCheck("DATABASE_URL"),
    nextAuthSecret: envCheck("NEXTAUTH_SECRET"),
    nextAuthUrl: envCheck("NEXTAUTH_URL"),
    emailFrom: envCheck("EMAIL_FROM"),
  };

  try {
    const [publishedActivities, categories, locations, adminUsers] = await Promise.all([
      prisma.activity.count({ where: { status: "PUBLISHED" } }),
      prisma.activityCategory.count(),
      prisma.location.count(),
      prisma.user.count({ where: { isAdmin: true, disabledAt: null } }),
    ]);

    checks.database = "ok";
    checks.publishedActivities = publishedActivities;
    checks.categories = categories;
    checks.locations = locations;
    checks.adminUsers = adminUsers;

    if (publishedActivities === 0) checks.publishedActivities = "warning";
    if (categories === 0) checks.categories = "warning";
    if (locations === 0) checks.locations = "warning";
    if (adminUsers === 0) checks.adminUsers = "warning";
  } catch (error) {
    console.error(
      JSON.stringify({
        level: "error",
        event: "release_health_database_failed",
        message: error instanceof Error ? error.message : "unknown",
      }),
    );
  }

  const requiredChecks = ["database", "databaseUrl", "nextAuthSecret", "nextAuthUrl", "emailFrom"];
  const ok = requiredChecks.every((check) => checks[check] === "ok");

  return NextResponse.json(
    {
      ok,
      service: "zuidlaren-agenda",
      status: ok ? "release_ready" : "release_attention_required",
      checks,
    },
    { status: ok ? 200 : 503 },
  );
}
