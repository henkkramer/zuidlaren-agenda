import { randomBytes, scryptSync } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function requiredEnv(name) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

function optionalEnv(name, fallback) {
  return process.env[name]?.trim() || fallback;
}

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 }).toString("hex");
  return `scrypt$16384$8$1$${salt}$${hash}`;
}

async function ensureCredentialColumns(prisma) {
  await prisma.$executeRawUnsafe('ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "credentialLogin" TEXT');
  await prisma.$executeRawUnsafe('ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordHash" TEXT');
  await prisma.$executeRawUnsafe('ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "mustChangePassword" BOOLEAN NOT NULL DEFAULT false');
  await prisma.$executeRawUnsafe('CREATE UNIQUE INDEX IF NOT EXISTS "User_credentialLogin_key" ON "User"("credentialLogin")');
}

async function ensureUser(prisma, input) {
  const credentialLogin = input.username.trim().toLowerCase();
  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ credentialLogin }, { email: input.email }],
    },
    select: { id: true, passwordHash: true },
  });

  const data = {
    credentialLogin,
    disabledAt: null,
    displayName: input.displayName,
    emailVerified: new Date(),
    isAdmin: input.isAdmin ?? false,
    mustChangePassword: true,
    ...(existing?.passwordHash ? {} : { passwordHash: hashPassword(input.password) }),
  };

  if (existing) {
    return prisma.user.update({
      where: { id: existing.id },
      data,
    });
  }

  return prisma.user.create({
    data: {
      ...data,
      email: input.email,
    },
  });
}

async function main() {
  const databaseUrl = requiredEnv("DATABASE_URL");
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
  });

  try {
    await ensureCredentialColumns(prisma);

    const admin = await ensureUser(prisma, {
      username: optionalEnv("SEED_ADMIN_USERNAME", "admin"),
      password: requiredEnv("SEED_ADMIN_PASSWORD"),
      email: optionalEnv("SEED_ADMIN_EMAIL", "admin@zuidlaren.local"),
      displayName: optionalEnv("SEED_ADMIN_DISPLAY_NAME", "Master admin"),
      isAdmin: true,
    });

    const user = await ensureUser(prisma, {
      username: optionalEnv("SEED_USER_USERNAME", "henk"),
      password: requiredEnv("SEED_USER_PASSWORD"),
      email: optionalEnv("SEED_USER_EMAIL", "henk@zuidlaren.local"),
      displayName: optionalEnv("SEED_USER_DISPLAY_NAME", "Henk"),
    });

    const owner = await ensureUser(prisma, {
      username: optionalEnv("SEED_OWNER_USERNAME", "eigenaar"),
      password: requiredEnv("SEED_OWNER_PASSWORD"),
      email: optionalEnv("SEED_OWNER_EMAIL", "eigenaar@zuidlaren.local"),
      displayName: optionalEnv("SEED_OWNER_DISPLAY_NAME", "Eigenaar"),
    });

    const ownerBusiness = await prisma.business.findFirst({
      where: { status: "APPROVED" },
      orderBy: { name: "asc" },
    });

    if (ownerBusiness) {
      await prisma.businessMember.upsert({
        where: {
          userId_businessId: {
            businessId: ownerBusiness.id,
            userId: owner.id,
          },
        },
        update: {
          active: true,
          canPublishActivities: true,
          role: "OWNER",
        },
        create: {
          active: true,
          businessId: ownerBusiness.id,
          canPublishActivities: true,
          role: "OWNER",
          userId: owner.id,
        },
      });
    }

    console.log(`Credential accounts ready: ${admin.credentialLogin}, ${user.credentialLogin}, ${owner.credentialLogin}.`);
    console.log(ownerBusiness ? `Business owner linked to: ${ownerBusiness.name}.` : "No approved business found; owner account was created without a business link.");
    console.log("Existing password hashes were left unchanged. Change seeded default passwords after login.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
