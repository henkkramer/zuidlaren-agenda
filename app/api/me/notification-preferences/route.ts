import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { rejectCrossOriginMutation } from "@/lib/csrf";
import { prisma } from "@/lib/prisma";

type PreferencesPayload = {
  activityReminders?: unknown;
  weeklyDigest?: unknown;
  businessUpdates?: unknown;
  categorySlugs?: unknown;
  locationSlugs?: unknown;
};

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

function parseSlugList(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter((item) => /^[a-z0-9_-]{1,60}$/.test(item)),
    ),
  ).slice(0, 20);
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

  const payload = (await request.json()) as PreferencesPayload;
  const [categorySlugs, locationSlugs] = await Promise.all([
    filterAllowedSlugs(parseSlugList(payload.categorySlugs), "category"),
    filterAllowedSlugs(parseSlugList(payload.locationSlugs), "location"),
  ]);
  const preferences = await prisma.notificationPreference.upsert({
    where: { userId: session.user.id },
    update: {
      activityReminders: payload.activityReminders === true,
      weeklyDigest: payload.weeklyDigest === true,
      businessUpdates: payload.businessUpdates === true,
      categorySlugs,
      locationSlugs,
    },
    create: {
      userId: session.user.id,
      activityReminders: payload.activityReminders === true,
      weeklyDigest: payload.weeklyDigest === true,
      businessUpdates: payload.businessUpdates === true,
      categorySlugs,
      locationSlugs,
    },
  });

  return NextResponse.json(serializePreferences(preferences));
}
