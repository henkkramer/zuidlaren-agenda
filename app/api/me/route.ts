import { NextResponse } from "next/server";
import { requireCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await requireCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  return NextResponse.json({
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    locale: user.locale,
    deletionRequestedAt: user.deletionRequestedAt,
  });
}
