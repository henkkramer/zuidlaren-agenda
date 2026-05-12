import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type PreferencesPayload = {
  activityReminders?: unknown;
  weeklyDigest?: unknown;
  businessUpdates?: unknown;
};

function serializePreferences(preferences: {
  activityReminders: boolean;
  weeklyDigest: boolean;
  businessUpdates: boolean;
}) {
  return {
    activityReminders: preferences.activityReminders,
    weeklyDigest: preferences.weeklyDigest,
    businessUpdates: preferences.businessUpdates,
  };
}

export async function GET() {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const preferences = await prisma.notificationPreference.upsert({
    where: { userId: session.user.id },
    update: {},
    create: { userId: session.user.id },
  });

  return NextResponse.json(serializePreferences(preferences));
}

export async function PATCH(request: Request) {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const payload = (await request.json()) as PreferencesPayload;
  const preferences = await prisma.notificationPreference.upsert({
    where: { userId: session.user.id },
    update: {
      activityReminders: payload.activityReminders === true,
      weeklyDigest: payload.weeklyDigest === true,
      businessUpdates: payload.businessUpdates === true,
    },
    create: {
      userId: session.user.id,
      activityReminders: payload.activityReminders === true,
      weeklyDigest: payload.weeklyDigest === true,
      businessUpdates: payload.businessUpdates === true,
    },
  });

  return NextResponse.json(serializePreferences(preferences));
}
