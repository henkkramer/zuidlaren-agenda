import { NextResponse } from "next/server";
import { requireBusinessPermission } from "@/lib/business-permissions";
import { parseBusinessActivityPayload, type BusinessActivityPayload } from "@/lib/business-activity-input";
import { mapActivityRecord } from "@/lib/activity-mapper";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";

type BusinessActivityContext = {
  params: Promise<{
    businessId: string;
    activityId: string;
  }>;
};

export async function PATCH(request: Request, context: BusinessActivityContext) {
  const { businessId, activityId } = await context.params;
  const access = await requireBusinessPermission(businessId);

  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  let input;

  try {
    const payload = (await request.json()) as BusinessActivityPayload;
    input = parseBusinessActivityPayload(payload, access.business.name);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Ongeldige activiteit" }, { status: 400 });
  }

  const existingActivity = await prisma.activity.findFirst({
    where: {
      OR: [{ id: activityId }, { slug: decodeURIComponent(activityId) }],
      businessId: access.business.id,
    },
  });

  if (!existingActivity) {
    return NextResponse.json({ error: "Activiteit niet gevonden" }, { status: 404 });
  }

  const category = await prisma.activityCategory.upsert({
    where: { slug: input.category },
    update: {},
    create: { slug: input.category, name: input.category },
  });

  const location = await prisma.location.upsert({
    where: { slug: slugify(input.locationName) },
    update: { name: input.locationName, address: input.address },
    create: { slug: slugify(input.locationName), name: input.locationName, address: input.address },
  });

  const activity = await prisma.activity.update({
    where: { id: existingActivity.id },
    data: {
      title: input.title,
      shortDescription: input.shortDescription,
      description: input.description,
      imageUrl: input.imageUrl,
      startAt: input.startAt,
      endAt: input.endAt,
      typeTags: input.typeTags,
      indoorOutdoor: input.indoorOutdoor,
      expectedVisitors: input.expectedVisitors,
      sourceUrl: input.sourceUrl,
      organizerName: input.organizerName,
      categoryId: category.id,
      locationId: location.id,
    },
    include: {
      category: true,
      location: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: access.userId,
      action: "business.activity.update",
      targetType: "Activity",
      targetId: activity.id,
      metadata: {
        businessId: access.business.id,
        status: activity.status,
      },
    },
  });

  return NextResponse.json({ activity: mapActivityRecord(activity), status: activity.status.toLowerCase() });
}
