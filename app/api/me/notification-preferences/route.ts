import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { rejectCrossOriginMutation } from "@/lib/csrf";
import { parseNotificationPreferencesInput } from "@/lib/notification-preferences-input";
import { prisma } from "@/lib/prisma";

function serializePreferences(preferences: {
  activityReminders: boolean;
  weeklyDigest: boolean;
  businessUpdates: boolean;
  categorySlugs: string[];
  locationSlugs: string[];
}) {
  return {
    activityReminders: preferences.activityReminders,
    weeklyDigest: preferences.weeklyDigest,
    businessUpdates: preferences.businessUpdates,
    categorySlugs: preferences.categorySlugs,
    locationSlugs: preferences.locationSlugs,
  };
}

async function filterAllowedSlugs(input: string[], model: "category" | "location") {
  if (input.length === 0) {
    return [];
  }

  if (model === "category") {
    const records = await prisma.activityCategory.findMany({
      where: { slug: { in: input } },
      select: { slug: true },
    });
    return records.map((record) => record.slug);
  }

  const records = await prisma.location.findMany({
    where: { slug: { in: input } },
    select: { slug: true },
  });
  return records.map((record) => record.slug);
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
  const csrfResponse = rejectCrossOriginMutation(request);
  if (csrfResponse) return csrfResponse;

  const session = await getCurrentSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const input = parseNotificationPreferencesInput((await request.json().catch(() => null)) ?? {});
  const [categorySlugs, locationSlugs] = await Promise.all([
    filterAllowedSlugs(input.categorySlugs, "category"),
    filterAllowedSlugs(input.locationSlugs, "location"),
  ]);
  const preferences = await prisma.notificationPreference.upsert({
    where: { userId: session.user.id },
    update: {
      activityReminders: input.activityReminders,
      weeklyDigest: input.weeklyDigest,
      businessUpdates: input.businessUpdates,
      categorySlugs,
      locationSlugs,
    },
    create: {
      userId: session.user.id,
      activityReminders: input.activityReminders,
      weeklyDigest: input.weeklyDigest,
      businessUpdates: input.businessUpdates,
      categorySlugs,
      locationSlugs,
    },
  });

  return NextResponse.json(serializePreferences(preferences));
}
