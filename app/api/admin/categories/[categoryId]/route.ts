import { NextResponse } from "next/server";
import { createAdminAuditLog, requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";

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
  const admin = await requireAdmin();

  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const { categoryId } = await context.params;
  const payload = (await request.json()) as CategoryPayload;
  const name = typeof payload.name === "string" ? payload.name.trim() : undefined;
  const slug = typeof payload.slug === "string" && payload.slug.trim() ? slugify(payload.slug) : undefined;

  if (!name && !slug) {
    return NextResponse.json({ error: "Geen wijziging opgegeven" }, { status: 400 });
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
