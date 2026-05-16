import "server-only";

import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type JsonInput = string | number | boolean | null | JsonInput[] | { [key: string]: JsonInput };
type AuditMetadata = Exclude<JsonInput, null>;

type AdminAccess =
  | {
      ok: true;
      userId: string;
    }
  | {
      ok: false;
      status: 401 | 403;
      error: string;
    };

export async function requireAdmin(): Promise<AdminAccess> {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    return { ok: false, status: 401, error: "Niet ingelogd" };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, isAdmin: true, disabledAt: true },
  });

  if (!user || user.disabledAt) {
    return { ok: false, status: 403, error: "Account is niet actief" };
  }

  if (!user.isAdmin) {
    return { ok: false, status: 403, error: "Geen adminrechten" };
  }

  return { ok: true, userId: user.id };
}

export async function createAdminAuditLog(input: {
  actorId: string;
  action: string;
  targetId?: string;
  targetType: string;
  metadata?: AuditMetadata;
}) {
  return prisma.auditLog.create({
    data: {
      actorId: input.actorId,
      action: input.action,
      targetId: input.targetId,
      targetType: input.targetType,
      metadata: input.metadata,
    },
  });
}
