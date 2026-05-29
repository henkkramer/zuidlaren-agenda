import "server-only";

import { mapActivityRecord } from "@/lib/activity-mapper";
import type { Activity } from "@/lib/activity-types";
import { prisma } from "@/lib/prisma";
import { activityRecordSelect } from "@/lib/prisma-selects";

export type PersonalAgendaItem = {
  activity: Activity;
  attendance: {
    status: "going" | "maybe";
    visibility: "private" | "public";
  };
};

export async function getPersonalAgendaItems(userId: string, now = new Date()): Promise<PersonalAgendaItem[]> {
  const attendances = await prisma.attendance.findMany({
    where: {
      userId,
      activity: {
        status: "PUBLISHED",
        endAt: { gte: now },
      },
    },
    select: {
      status: true,
      visibility: true,
      activity: {
        select: activityRecordSelect,
      },
    },
    orderBy: {
      activity: {
        startAt: "asc",
      },
    },
  });

  return attendances.map((attendance) => ({
    activity: mapActivityRecord(attendance.activity),
    attendance: {
      status: attendance.status.toLowerCase() as "going" | "maybe",
      visibility: attendance.visibility.toLowerCase() as "private" | "public",
    },
  }));
}

export async function getPersonalAgendaActivities(userId: string, now = new Date()): Promise<Activity[]> {
  const items = await getPersonalAgendaItems(userId, now);
  return items.map((item) => item.activity);
}
