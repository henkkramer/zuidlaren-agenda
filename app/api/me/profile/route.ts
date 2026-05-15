import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { rejectCrossOriginMutation } from "@/lib/csrf";
import { parseProfileInput } from "@/lib/profile-input";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
  const csrfResponse = rejectCrossOriginMutation(request);
  if (csrfResponse) return csrfResponse;

  const session = await getCurrentSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  let input;

  try {
    input = parseProfileInput((await request.json()) as Record<string, unknown>);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Ongeldig profiel" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      displayName: input.displayName,
      locale: input.locale,
      deletionRequestedAt: input.deletionRequested ? new Date() : null,
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
