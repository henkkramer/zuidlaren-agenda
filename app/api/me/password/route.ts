import { getCurrentSession } from "@/lib/auth";
import { hashPassword, isValidNewPassword, verifyPassword } from "@/lib/password-auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    return Response.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { currentPassword?: unknown; newPassword?: unknown } | null;
  const currentPassword = typeof body?.currentPassword === "string" ? body.currentPassword : "";
  const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";

  if (!isValidNewPassword(newPassword)) {
    return Response.json({ error: "Nieuw wachtwoord moet minimaal 8 tekens zijn" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, passwordHash: true },
  });

  if (!user?.passwordHash) {
    return Response.json({ error: "Dit account gebruikt geen wachtwoordlogin" }, { status: 400 });
  }

  if (!verifyPassword(currentPassword, user.passwordHash)) {
    return Response.json({ error: "Huidig wachtwoord klopt niet" }, { status: 403 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      mustChangePassword: false,
      passwordHash: hashPassword(newPassword),
    },
  });

  return Response.json({ ok: true });
}
