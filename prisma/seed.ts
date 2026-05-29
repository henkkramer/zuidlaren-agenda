import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { aiActivityActions } from "../lib/ai-card-assistant-types";
import { categoryLabels } from "../lib/activity-types";
import { seedActivities } from "./seed-activities";
import { hashPassword, normalizeCredentialLogin } from "../lib/password-auth";
import { slugify } from "../lib/slugify";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
});

const prisma = new PrismaClient({
  adapter
});

type SeedCredentialUser = {
  displayName: string;
  email: string;
  isAdmin?: boolean;
  password: string;
  username: string;
};

async function ensureCredentialUser(input: SeedCredentialUser) {
  const credentialLogin = normalizeCredentialLogin(input.username);
  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ credentialLogin }, { email: input.email }]
    },
    select: { id: true, passwordHash: true }
  });

  if (!existing) {
    return prisma.user.create({
      data: {
        credentialLogin,
        disabledAt: null,
        displayName: input.displayName,
        email: input.email,
        emailVerified: new Date(),
        isAdmin: input.isAdmin ?? false,
        mustChangePassword: true,
        passwordHash: hashPassword(input.password)
      }
    });
  }

  return prisma.user.update({
    where: { id: existing.id },
    data: {
      credentialLogin,
      disabledAt: null,
      displayName: input.displayName,
      isAdmin: input.isAdmin ?? false,
      ...(existing.passwordHash
        ? {}
        : {
            mustChangePassword: true,
            passwordHash: hashPassword(input.password)
          })
    }
  });
}

function requiredSeedPassword(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required when SEED_CREDENTIAL_ACCOUNTS=true`);
  }

  return value;
}

async function seedCredentialAccounts() {
  if (process.env.SEED_CREDENTIAL_ACCOUNTS !== "true") {
    return null;
  }

  const [adminUser, regularUser, ownerUser] = await Promise.all([
    ensureCredentialUser({
      displayName: process.env.SEED_ADMIN_DISPLAY_NAME?.trim() || "Master admin",
      email: process.env.SEED_ADMIN_EMAIL?.trim() || "admin@zuidlaren.local",
      isAdmin: true,
      password: requiredSeedPassword("SEED_ADMIN_PASSWORD"),
      username: process.env.SEED_ADMIN_USERNAME?.trim() || "admin"
    }),
    ensureCredentialUser({
      displayName: process.env.SEED_USER_DISPLAY_NAME?.trim() || "Henk",
      email: process.env.SEED_USER_EMAIL?.trim() || "henk@zuidlaren.local",
      password: requiredSeedPassword("SEED_USER_PASSWORD"),
      username: process.env.SEED_USER_USERNAME?.trim() || "henk"
    }),
    ensureCredentialUser({
      displayName: process.env.SEED_OWNER_DISPLAY_NAME?.trim() || "Eigenaar",
      email: process.env.SEED_OWNER_EMAIL?.trim() || "eigenaar@zuidlaren.local",
      password: requiredSeedPassword("SEED_OWNER_PASSWORD"),
      username: process.env.SEED_OWNER_USERNAME?.trim() || "eigenaar"
    })
  ]);

  const ownerBusiness = await prisma.business.findFirst({
    where: { status: "APPROVED" },
    orderBy: { name: "asc" }
  });

  if (ownerBusiness) {
    await prisma.businessMember.upsert({
      where: {
        userId_businessId: {
          businessId: ownerBusiness.id,
          userId: ownerUser.id
        }
      },
      update: {
        active: true,
        canPublishActivities: true,
        role: "OWNER"
      },
      create: {
        active: true,
        businessId: ownerBusiness.id,
        canPublishActivities: true,
        role: "OWNER",
        userId: ownerUser.id
      }
    });
  }

  return { adminUser, regularUser, ownerUser };
}

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

  for (const activity of seedActivities) {
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

  await prisma.featureFlag.upsert({
    where: { key: "billing_foundation" },
    update: { enabled: false },
    create: {
      key: "billing_foundation",
      enabled: false,
      description: "Keeps payment and billing foundations visible for admins without enabling live payments."
    }
  });

  for (const action of aiActivityActions) {
    await prisma.aiPromptTemplate.upsert({
      where: {
        key_version: {
          key: `activity-assist.${action}`,
          version: 1
        }
      },
      update: {
        active: true
      },
      create: {
        key: `activity-assist.${action}`,
        version: 1,
        title: `Activity assist: ${action}`,
        prompt: "Help a Zuidlaren business improve an activity card. Return review-only suggestions; never publish or save content.",
        active: true
      }
    });
  }

  const seededUsers = await seedCredentialAccounts();
  const activityCount = await prisma.activity.count();
  console.log(`Seeded ${activityCount} activities.`);

  if (seededUsers) {
    console.log(`Seeded credential accounts: ${seededUsers.adminUser.credentialLogin}, ${seededUsers.regularUser.credentialLogin}, ${seededUsers.ownerUser.credentialLogin}.`);
  } else {
    console.log("Skipped credential account seeding. Set SEED_CREDENTIAL_ACCOUNTS=true to create local credential accounts.");
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
