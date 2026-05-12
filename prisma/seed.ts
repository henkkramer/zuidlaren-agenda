import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { categoryLabels } from "../lib/activity-types";
import { mockActivities } from "../lib/mock-activities";
import { slugify } from "../lib/slugify";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
});

const prisma = new PrismaClient({
  adapter
});

async function main() {
  const categoryBySlug = new Map<string, string>();

  for (const [slug, name] of Object.entries(categoryLabels)) {
    const category = await prisma.activityCategory.upsert({
      where: { slug },
      update: { name },
      create: { slug, name }
    });
    categoryBySlug.set(slug, category.id);
  }

  for (const activity of mockActivities) {
    const businessSlug = slugify(activity.organizerName);
    const business = await prisma.business.upsert({
      where: { slug: businessSlug },
      update: {
        name: activity.organizerName,
        status: "APPROVED",
        website: activity.sourceUrl
      },
      create: {
        slug: businessSlug,
        name: activity.organizerName,
        status: "APPROVED",
        website: activity.sourceUrl
      }
    });

    const locationSlug = slugify(activity.locationName);
    const location = await prisma.location.upsert({
      where: { slug: locationSlug },
      update: {
        name: activity.locationName,
        address: activity.address
      },
      create: {
        slug: locationSlug,
        name: activity.locationName,
        address: activity.address
      }
    });

    const categoryId = categoryBySlug.get(activity.category);
    if (!categoryId) {
      throw new Error(`Missing category ${activity.category}`);
    }

    await prisma.activity.upsert({
      where: { slug: activity.id },
      update: {
        title: activity.title,
        shortDescription: activity.shortDescription,
        description: activity.longDescription,
        imageUrl: activity.imageUrl,
        startAt: new Date(activity.startDateTime),
        endAt: new Date(activity.endDateTime),
        typeTags: activity.typeTags,
        indoorOutdoor: activity.indoorOutdoor,
        expectedVisitors: activity.expectedVisitors,
        sourceQuality: activity.sourceQuality,
        sourceUrl: activity.sourceUrl,
        organizerName: activity.organizerName,
        categoryId,
        locationId: location.id,
        businessId: business.id,
        status: "PUBLISHED"
      },
      create: {
        slug: activity.id,
        title: activity.title,
        shortDescription: activity.shortDescription,
        description: activity.longDescription,
        imageUrl: activity.imageUrl,
        startAt: new Date(activity.startDateTime),
        endAt: new Date(activity.endDateTime),
        typeTags: activity.typeTags,
        indoorOutdoor: activity.indoorOutdoor,
        expectedVisitors: activity.expectedVisitors,
        sourceQuality: activity.sourceQuality,
        sourceUrl: activity.sourceUrl,
        organizerName: activity.organizerName,
        categoryId,
        locationId: location.id,
        businessId: business.id,
        status: "PUBLISHED"
      }
    });
  }

  await prisma.featureFlag.upsert({
    where: { key: "ai_card_assistant" },
    update: { enabled: false },
    create: {
      key: "ai_card_assistant",
      enabled: false,
      description: "Enables AI assistance in the business activity editor."
    }
  });

  const activityCount = await prisma.activity.count();
  console.log(`Seeded ${activityCount} activities.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
