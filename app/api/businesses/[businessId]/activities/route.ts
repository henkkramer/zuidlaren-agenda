import { NextResponse } from "next/server";
import { requireBusinessPermission } from "@/lib/business-permissions";
import { parseBusinessActivityPayload, type BusinessActivityPayload } from "@/lib/business-activity-input";
import { mapActivityRecord } from "@/lib/activity-mapper";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";

type BusinessActivitiesContext = {
  params: Promise<{
    businessId: string;
  }>;
};

export async function GET(_request: Request, context: BusinessActivitiesContext) {
  const { businessId } = await context.params;
  const access = await requireBusinessPermission(businessId);

  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  const activities = await prisma.activity.findMany({
    where: { businessId: access.business.id },
    include: {
      category: true,
      location: true,
    },
    orderBy: { startAt: "asc" },
  });

  return NextResponse.json({
    business: {
      id: access.business.id,
      slug: access.business.slug,
      name: access.business.name,
      status: access.business.status.toLowerCase(),
    },
    membership: {
      role: access.membership.role.toLowerCase(),
      canPublishActivities: access.membership.role === "OWNER" || access.membership.canPublishActivities,
    },
    activities: activities.map(mapActivityRecord),
  });
}

export async function POST(request: Request, context: BusinessActivitiesContext) {
  const { businessId } = await context.params;
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

  const activity = await prisma.activity.create({
    data: {
      slug: `${input.slug}-${Date.now().toString(36)}`,
      title: input.title,
      shortDescription: input.shortDescription,
      description: input.description,
      imageUrl: input.imageUrl,
      startAt: input.startAt,
      endAt: input.endAt,
      status: "DRAFT",
      typeTags: input.typeTags,
      indoorOutdoor: input.indoorOutdoor,
      expectedVisitors: input.expectedVisitors,
      sourceQuality: "Business draft",
      sourceUrl: input.sourceUrl,
      organizerName: input.organizerName,
      categoryId: category.id,
      locationId: location.id,
      businessId: access.business.id,
    },
    include: {
      category: true,
      location: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: access.userId,
      action: "business.activity.create",
      targetType: "Activity",
      targetId: activity.id,
      metadata: {
        businessId: access.business.id,
        status: activity.status,
      },
    },
  });

  return NextResponse.json({ activity: mapActivityRecord(activity), status: activity.status.toLowerCase() }, { status: 201 });
}
