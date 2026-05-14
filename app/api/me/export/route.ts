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
    include: {
      notificationPreferences: true,
      attendances: {
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
      },
      businessMemberships: {
        include: {
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
