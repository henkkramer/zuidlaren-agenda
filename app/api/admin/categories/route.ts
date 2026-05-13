import { NextResponse } from "next/server";
import { createAdminAuditLog, requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";

type CategoryPayload = {
  name?: unknown;
  slug?: unknown;
};

export async function GET() {
  const admin = await requireAdmin();

  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const categories = await prisma.activityCategory.findMany({
    include: {
      _count: {
        select: { activities: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ categories });
}

export async function POST(request: Request) {
  const admin = await requireAdmin();

  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const payload = (await request.json()) as CategoryPayload;
  const name = typeof payload.name === "string" ? payload.name.trim() : "";

  if (!name) {
    return NextResponse.json({ error: "Categorienaam is verplicht" }, { status: 400 });
  }

  const category = await prisma.activityCategory.create({
    data: {
      name,
      slug: typeof payload.slug === "string" && payload.slug.trim() ? slugify(payload.slug) : slugify(name),
    },
  });

  await createAdminAuditLog({
    actorId: admin.userId,
    action: "admin.category.create",
    targetType: "ActivityCategory",
    targetId: category.id,
    metadata: { slug: category.slug, name: category.name },
  });

  return NextResponse.json({ category }, { status: 201 });
}
