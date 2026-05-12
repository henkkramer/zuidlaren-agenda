import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type ProfilePayload = {
  displayName?: unknown;
  locale?: unknown;
  deletionRequested?: unknown;
};

export async function PATCH(request: Request) {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const payload = (await request.json()) as ProfilePayload;
  const displayName = typeof payload.displayName === "string" ? payload.displayName.trim() : "";
  const locale = payload.locale === "en-US" ? "en-US" : "nl-NL";

  if (displayName.length < 2 || displayName.length > 80) {
    return NextResponse.json({ error: "Naam moet 2 tot 80 tekens zijn" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      displayName,
      locale,
      deletionRequestedAt: payload.deletionRequested === true ? new Date() : null,
    },
  });

  return NextResponse.json({
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    locale: user.locale,
    deletionRequestedAt: user.deletionRequestedAt,
  });
}
