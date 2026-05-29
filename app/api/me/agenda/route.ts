import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { getPersonalAgendaItems } from "@/lib/personal-agenda";

export async function GET() {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const activities = await getPersonalAgendaItems(session.user.id);

  return NextResponse.json({
    activities,
  });
}
