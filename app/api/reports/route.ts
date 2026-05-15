import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { rejectCrossOriginMutation } from "@/lib/csrf";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { parseReportInput } from "@/lib/report-input";

function reportRateLimitKey(request: Request, userId?: string) {
  if (userId) return `report:user:${userId}`;
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  return `report:ip:${forwardedFor || realIp || "unknown"}`;
}

export async function POST(request: Request) {
  const csrfResponse = rejectCrossOriginMutation(request);
  if (csrfResponse) return csrfResponse;

  const session = await getCurrentSession();
  const rateLimit = checkRateLimit({ key: reportRateLimitKey(request, session?.user?.id), limit: 5, windowMs: 60 * 60_000 });

  if (rateLimit.limited) {
    const response = rateLimitResponse(rateLimit.resetAt);
    return NextResponse.json(response.body, response.init);
  }

  let input;

  try {
    const payload = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    input = parseReportInput(payload ?? {});
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Ongeldige melding" }, { status: 400 });
  }

  const activity = input.activityId
    ? await prisma.activity.findUnique({
        where: { slug: input.activityId },
        select: { id: true, status: true },
      })
    : null;

  if (input.activityId && (!activity || activity.status !== "PUBLISHED")) {
    return NextResponse.json({ error: "Activiteit niet gevonden" }, { status: 404 });
  }

  const report = await prisma.report.create({
    data: {
      activityId: activity?.id,
      details: input.details,
      reason: input.reason,
      reporterId: session?.user?.id,
    },
    select: {
      id: true,
      status: true,
    },
  });

  return NextResponse.json({ report }, { status: 201 });
}
