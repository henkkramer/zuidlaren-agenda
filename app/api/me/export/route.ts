import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { buildPrivacyExport } from "@/lib/privacy-export";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      displayName: true,
      locale: true,
      deletionRequestedAt: true,
      createdAt: true,
      updatedAt: true,
      notificationPreferences: {
        select: {
          activityReminders: true,
          weeklyDigest: true,
          businessUpdates: true,
          categorySlugs: true,
          locationSlugs: true,
        },
      },
      attendances: {
        select: {
          status: true,
          visibility: true,
          createdAt: true,
          updatedAt: true,
          activity: {
            select: {
              slug: true,
              title: true,
              startAt: true,
              endAt: true,
              organizerName: true,
              category: { select: { name: true, slug: true } },
              location: { select: { name: true, slug: true } },
            },
          },
        },
        orderBy: {
          activity: {
            startAt: "asc",
          },
        },
      },
      businessMemberships: {
        select: {
          active: true,
          role: true,
          canPublishActivities: true,
          createdAt: true,
          updatedAt: true,
          business: {
            select: {
              name: true,
              slug: true,
              status: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Account niet gevonden" }, { status: 404 });
  }

  return NextResponse.json(buildPrivacyExport(user), {
    headers: {
      "Content-Disposition": "attachment; filename=\"zuidlaren-agenda-gegevens.json\"",
    },
  });
}
