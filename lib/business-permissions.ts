import "server-only";

import type { Business, BusinessMember } from "@prisma/client";
import { getCurrentSession } from "@/lib/auth";
import { evaluateBusinessPermission, type BusinessPermission } from "@/lib/business-permission-rules";
import { prisma } from "@/lib/prisma";

type BusinessAccess =
  | {
      ok: true;
      userId: string;
      business: Business;
      membership: BusinessMember;
    }
  | {
      ok: false;
      status: 401 | 403 | 404;
      error: string;
    };

export async function getBusinessByParam(businessId: string) {
  return prisma.business.findFirst({
    where: {
      OR: [{ id: businessId }, { slug: businessId }],
    },
  });
}

export async function requireBusinessPermission(
  businessId: string,
  permission: BusinessPermission = "view",
): Promise<BusinessAccess> {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    return { ok: false, status: 401, error: "Niet ingelogd" };
  }

  const business = await getBusinessByParam(decodeURIComponent(businessId));

  if (!business) {
    return { ok: false, status: 404, error: "Bedrijf niet gevonden" };
  }

  const membership = await prisma.businessMember.findUnique({
    where: {
      userId_businessId: {
        userId: session.user.id,
        businessId: business.id,
      },
    },
  });

  if (!membership?.active) {
    return { ok: false, status: 403, error: "Geen toegang tot dit bedrijf" };
  }

  const permissionResult = evaluateBusinessPermission(
    {
      businessStatus: business.status,
      canPublishActivities: membership.canPublishActivities,
      membershipActive: membership.active,
      role: membership.role,
    },
    permission,
  );

  if (!permissionResult.ok) {
    return permissionResult;
  }

  return { ok: true, userId: session.user.id, business, membership };
}

export async function getCurrentBusinessMemberships() {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    return null;
  }

  return prisma.businessMember.findMany({
    where: {
      userId: session.user.id,
      active: true,
    },
    include: {
      business: true,
    },
    orderBy: {
      business: {
        name: "asc",
      },
    },
  });
}
