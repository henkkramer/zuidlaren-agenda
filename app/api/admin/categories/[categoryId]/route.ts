import { NextResponse } from "next/server";
import { createAdminAuditLog, requireAdmin } from "@/lib/admin-auth";
import { rejectCrossOriginMutation } from "@/lib/csrf";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";
import { accessDeniedResponse, badRequestResponse } from "@/lib/route-helpers";

type CategoryContext = {
  params: Promise<{
    categoryId: string;
  }>;
};

type CategoryPayload = {
  name?: unknown;
  slug?: unknown;
};

export async function PATCH(request: Request, context: CategoryContext) {
  const csrfResponse = rejectCrossOriginMutation(request);
  if (csrfResponse) return csrfResponse;

  const admin = await requireAdmin();

  if (!admin.ok) {
    return accessDeniedResponse(admin);
  }

  const { categoryId } = await context.params;
  const payload = (await request.json()) as CategoryPayload;
  const name = typeof payload.name === "string" ? payload.name.trim() : undefined;
  const slug = typeof payload.slug === "string" && payload.slug.trim() ? slugify(payload.slug) : undefined;

  if (!name && !slug) {
    return badRequestResponse("Geen wijziging opgegeven");
  }

  const category = await prisma.activityCategory.update({
    where: { id: categoryId },
    data: {
      ...(name ? { name } : {}),
      ...(slug ? { slug } : {}),
    },
  });

  await createAdminAuditLog({
    actorId: admin.userId,
    action: "admin.category.update",
    targetType: "ActivityCategory",
    targetId: category.id,
    metadata: { slug: category.slug, name: category.name },
  });

  return NextResponse.json({ category });
}
