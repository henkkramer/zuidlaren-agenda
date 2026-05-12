import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type AttendanceRouteContext = {
  params: Promise<{
    activityId: string;
  }>;
};

type AttendancePayload = {
  status?: unknown;
  visibility?: unknown;
};

function toAttendanceStatus(value: unknown) {
  if (value === "maybe") {
    return "MAYBE" as const;
  }

  if (value === undefined || value === "going") {
    return "GOING" as const;
  }

  return null;
}

function toAttendanceVisibility(value: unknown) {
  if (value === "public") {
    return "PUBLIC" as const;
  }

  if (value === undefined || value === "private") {
    return "PRIVATE" as const;
  }

  return null;
}

async function getPublishedActivity(activityId: string) {
  return prisma.activity.findUnique({
    where: { slug: decodeURIComponent(activityId) },
    select: { id: true, status: true },
  });
}

async function requireSessionUser() {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    return null;
  }

  return session.user.id;
}

function serializeAttendance(attendance: { status: string; visibility: string }) {
  return {
    status: attendance.status.toLowerCase(),
    visibility: attendance.visibility.toLowerCase(),
  };
}

export async function POST(request: Request, context: AttendanceRouteContext) {
  const userId = await requireSessionUser();

  if (!userId) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const { activityId } = await context.params;
  const activity = await getPublishedActivity(activityId);

  if (!activity || activity.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Activiteit niet gevonden" }, { status: 404 });
  }

  const payload = (await request.json().catch(() => ({}))) as AttendancePayload;
  const status = toAttendanceStatus(payload.status);
  const visibility = toAttendanceVisibility(payload.visibility);

  if (!status || !visibility) {
    return NextResponse.json({ error: "Ongeldige aanwezigheid" }, { status: 400 });
  }

  const attendance = await prisma.attendance.upsert({
    where: {
      userId_activityId: {
        userId,
        activityId: activity.id,
      },
    },
    update: { status, visibility },
    create: {
      userId,
      activityId: activity.id,
      status,
      visibility,
    },
  });

  return NextResponse.json({ attendance: serializeAttendance(attendance) });
}

export async function PATCH(request: Request, context: AttendanceRouteContext) {
  const userId = await requireSessionUser();

  if (!userId) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const { activityId } = await context.params;
  const activity = await getPublishedActivity(activityId);

  if (!activity || activity.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Activiteit niet gevonden" }, { status: 404 });
  }

  const payload = (await request.json()) as AttendancePayload;
  const status = payload.status === undefined ? undefined : toAttendanceStatus(payload.status);
  const visibility = payload.visibility === undefined ? undefined : toAttendanceVisibility(payload.visibility);

  if (status === null || visibility === null) {
    return NextResponse.json({ error: "Ongeldige aanwezigheid" }, { status: 400 });
  }

  const attendance = await prisma.attendance.update({
    where: {
      userId_activityId: {
        userId,
        activityId: activity.id,
      },
    },
    data: {
      ...(status ? { status } : {}),
      ...(visibility ? { visibility } : {}),
    },
  });

  return NextResponse.json({ attendance: serializeAttendance(attendance) });
}

export async function DELETE(_request: Request, context: AttendanceRouteContext) {
  const userId = await requireSessionUser();

  if (!userId) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const { activityId } = await context.params;
  const activity = await getPublishedActivity(activityId);

  if (!activity) {
    return NextResponse.json({ ok: true });
  }

  await prisma.attendance.deleteMany({
    where: {
      userId,
      activityId: activity.id,
    },
  });

  return NextResponse.json({ ok: true });
}
