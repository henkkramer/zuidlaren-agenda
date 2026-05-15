import { NextResponse } from "next/server";
import { requireBusinessPermission } from "@/lib/business-permissions";
import { rejectCrossOriginMutation } from "@/lib/csrf";
import { prisma } from "@/lib/prisma";

type BusinessRouteContext = {
  params: Promise<{
    businessId: string;
  }>;
};

type CreateMemberPayload = {
  email?: unknown;
  role?: unknown;
  canPublishActivities?: unknown;
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

export async function GET(_request: Request, context: BusinessRouteContext) {
  const { businessId } = await context.params;
  const access = await requireBusinessPermission(businessId);

  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  const members = await prisma.businessMember.findMany({
    where: { businessId: access.business.id },
    include: { user: true },
    orderBy: [{ role: "desc" }, { createdAt: "asc" }],
  });

  return NextResponse.json({ members: members.map(serializeMember) });
}

export async function POST(request: Request, context: BusinessRouteContext) {
  const csrfResponse = rejectCrossOriginMutation(request);
  if (csrfResponse) return csrfResponse;

  const { businessId } = await context.params;
  const access = await requireBusinessPermission(businessId, "manageMembers");

  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  const payload = (await request.json()) as CreateMemberPayload;
  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  const role = payload.role === "owner" ? "OWNER" : "EMPLOYEE";

  if (!email.includes("@")) {
    return NextResponse.json({ error: "Geldig e-mailadres is verplicht" }, { status: 400 });
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email },
  });

  const member = await prisma.businessMember.upsert({
    where: {
      userId_businessId: {
        userId: user.id,
        businessId: access.business.id,
      },
    },
    update: {
      role,
      active: true,
      canPublishActivities: role === "OWNER" || payload.canPublishActivities === true,
    },
    create: {
      userId: user.id,
      businessId: access.business.id,
      role,
      canPublishActivities: role === "OWNER" || payload.canPublishActivities === true,
    },
    include: { user: true },
  });

  await prisma.auditLog.create({
    data: {
      actorId: access.userId,
      action: "business.member.upsert",
      targetType: "BusinessMember",
      targetId: member.id,
      metadata: {
        businessId: access.business.id,
        role: member.role,
        canPublishActivities: member.canPublishActivities,
      },
    },
  });

  return NextResponse.json({ member: serializeMember(member) }, { status: 201 });
}
