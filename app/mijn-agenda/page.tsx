import Link from "next/link";
import { redirect } from "next/navigation";
import { PersonalAgendaShell } from "@/components/personal-agenda-shell";
import { getCurrentSession } from "@/lib/auth";
import { mapActivityRecord } from "@/lib/activity-mapper";
import { prisma } from "@/lib/prisma";

type PersonalAgendaAttendanceRow = {
  activity: Parameters<typeof mapActivityRecord>[0];
  status: string;
  visibility: string;
};

export const dynamic = "force-dynamic";

export default async function MyAgendaPage() {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    redirect("/account");
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

  return (
    <main className="account-page" id="main-content">
      <section className="account-shell personal-agenda-shell">
        <Link className="account-back" href="/">
          Terug naar agenda
        </Link>
        <p className="account-kicker">Mijn Zuidlaren Agenda</p>
        <h1>Mijn agenda</h1>
        <PersonalAgendaShell
          items={(attendances as PersonalAgendaAttendanceRow[]).map((attendance) => ({
            activity: mapActivityRecord(attendance.activity),
            attendance: {
              status: attendance.status.toLowerCase() as "going" | "maybe",
              visibility: attendance.visibility.toLowerCase() as "private" | "public",
            },
          }))}
        />
      </section>
    </main>
  );
}
