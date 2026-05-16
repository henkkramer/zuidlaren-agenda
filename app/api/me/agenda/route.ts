import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { mapActivityRecord } from "@/lib/activity-mapper";
import { prisma } from "@/lib/prisma";

type AgendaAttendanceRow = {
  activity: Parameters<typeof mapActivityRecord>[0];
  status: string;
  visibility: string;
};

export async function GET() {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const attendances = await prisma.attendance.findMany({
    where: {
      userId: session.user.id,
      activity: {
        status: "PUBLISHED",
        endAt: { gte: new Date() },
      },
    },
    include: {
      activity: {
        include: {
          category: true,
          location: true,
        },
      },
    },
    orderBy: {
      activity: {
        startAt: "asc",
      },
    },
  });

  return NextResponse.json({
    activities: (attendances as AgendaAttendanceRow[]).map((attendance) => ({
      activity: mapActivityRecord(attendance.activity),
      attendance: {
        status: attendance.status.toLowerCase(),
        visibility: attendance.visibility.toLowerCase(),
      },
    })),
  });
}
