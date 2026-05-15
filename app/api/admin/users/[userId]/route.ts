import { NextResponse } from "next/server";
import { createAdminAuditLog, requireAdmin } from "@/lib/admin-auth";
import { rejectCrossOriginMutation } from "@/lib/csrf";
import { prisma } from "@/lib/prisma";

type UserContext = {
  params: Promise<{
    userId: string;
  }>;
};

type UserPatchPayload = {
  disabled?: unknown;
  isAdmin?: unknown;
};

export async function PATCH(request: Request, context: UserContext) {
  const csrfResponse = rejectCrossOriginMutation(request);
  if (csrfResponse) return csrfResponse;

  const admin = await requireAdmin();

  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const { userId } = await context.params;
  const payload = (await request.json()) as UserPatchPayload;

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(typeof payload.disabled === "boolean" ? { disabledAt: payload.disabled ? new Date() : null } : {}),
      ...(typeof payload.isAdmin === "boolean" ? { isAdmin: payload.isAdmin } : {}),
    },
    select: {
      id: true,
      email: true,
      isAdmin: true,
      disabledAt: true,
    },
  });

  await createAdminAuditLog({
    actorId: admin.userId,
    action: "admin.user.update",
    targetType: "User",
    targetId: user.id,
    metadata: { disabled: Boolean(user.disabledAt), isAdmin: user.isAdmin },
  });

  return NextResponse.json({ user });
}
