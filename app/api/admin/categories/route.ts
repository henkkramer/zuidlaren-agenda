import { NextResponse } from "next/server";
import { createAdminAuditLog, requireAdmin } from "@/lib/admin-auth";
import { rejectCrossOriginMutation } from "@/lib/csrf";
import { prisma } from "@/lib/prisma";
import { revalidatePublicActivityCaches } from "@/lib/public-activity-cache";
import { slugify } from "@/lib/slugify";
import { accessDeniedResponse, badRequestResponse } from "@/lib/route-helpers";

type CategoryPayload = {
  name?: unknown;
  slug?: unknown;
};

export async function GET() {
  const admin = await requireAdmin();

  if (!admin.ok) {
    return accessDeniedResponse(admin);
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
  const csrfResponse = rejectCrossOriginMutation(request);
  if (csrfResponse) return csrfResponse;

  const admin = await requireAdmin();

  if (!admin.ok) {
    return accessDeniedResponse(admin);
  }

  const payload = (await request.json()) as CategoryPayload;
  const name = typeof payload.name === "string" ? payload.name.trim() : "";

  if (!name) {
    return badRequestResponse("Categorienaam is verplicht");
  }

  const category = await prisma.activityCategory.create({
    data: {
      name,
      slug: typeof payload.slug === "string" && payload.slug.trim() ? slugify(payload.slug) : slugify(name),
    },
  });

  revalidatePublicActivityCaches({ filterOptions: true });

  await createAdminAuditLog({
    actorId: admin.userId,
    action: "admin.category.create",
    targetType: "ActivityCategory",
    targetId: category.id,
    metadata: { slug: category.slug, name: category.name },
  });

  return NextResponse.json({ category }, { status: 201 });
}
