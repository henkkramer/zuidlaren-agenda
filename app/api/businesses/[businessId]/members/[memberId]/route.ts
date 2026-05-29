import { NextResponse } from "next/server";
import { requireBusinessPermission } from "@/lib/business-permissions";
import { rejectCrossOriginMutation } from "@/lib/csrf";
import { prisma } from "@/lib/prisma";
import { accessDeniedResponse } from "@/lib/route-helpers";

type MemberRouteContext = {
  params: Promise<{
    businessId: string;
    memberId: string;
  }>;
};

type UpdateMemberPayload = {
  role?: unknown;
  canPublishActivities?: unknown;
  active?: unknown;
};

function serializeMember(member: {
  id: string;
  role: string;
  active: boolean;
  canPublishActivities: boolean;
  user: { email: string; displayName: string | null; name: string | null };
}) {
  return {
    id: member.id,
    email: member.user.email,
    displayName: member.user.displayName ?? member.user.name,
    role: member.role.toLowerCase(),
    active: member.active,
    canPublishActivities: member.canPublishActivities,
  };
}

export async function PATCH(request: Request, context: MemberRouteContext) {
  const csrfResponse = rejectCrossOriginMutation(request);
  if (csrfResponse) return csrfResponse;

  const { businessId, memberId } = await context.params;
  const access = await requireBusinessPermission(businessId, "manageMembers");

  if (!access.ok) {
    return accessDeniedResponse(access);
  }

  const payload = (await request.json()) as UpdateMemberPayload;
  const role = payload.role === "owner" ? "OWNER" : payload.role === "employee" ? "EMPLOYEE" : undefined;

  const member = await prisma.businessMember.update({
    where: {
      id: memberId,
      businessId: access.business.id,
    },
    data: {
      ...(role ? { role } : {}),
      ...(typeof payload.active === "boolean" ? { active: payload.active } : {}),
      ...(typeof payload.canPublishActivities === "boolean"
        ? { canPublishActivities: role === "OWNER" || payload.canPublishActivities }
        : {}),
    },
    include: { user: true },
  });

  await prisma.auditLog.create({
    data: {
      actorId: access.userId,
      action: "business.member.update",
      targetType: "BusinessMember",
      targetId: member.id,
      metadata: {
        businessId: access.business.id,
        role: member.role,
        active: member.active,
        canPublishActivities: member.canPublishActivities,
      },
    },
  });

  return NextResponse.json({ member: serializeMember(member) });
}

export async function DELETE(request: Request, context: MemberRouteContext) {
  const csrfResponse = rejectCrossOriginMutation(request);
  if (csrfResponse) return csrfResponse;

  const { businessId, memberId } = await context.params;
  const access = await requireBusinessPermission(businessId, "manageMembers");

  if (!access.ok) {
    return accessDeniedResponse(access);
  }

  const member = await prisma.businessMember.update({
    where: {
      id: memberId,
      businessId: access.business.id,
    },
    data: {
      active: false,
      canPublishActivities: false,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: access.userId,
      action: "business.member.deactivate",
      targetType: "BusinessMember",
      targetId: member.id,
      metadata: {
        businessId: access.business.id,
      },
    },
  });

  return NextResponse.json({ ok: true });
}
