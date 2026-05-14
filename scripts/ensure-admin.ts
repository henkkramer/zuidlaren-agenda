import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { logError, logInfo } from "../lib/structured-log";

const adminDisplayName = process.env.ADMIN_DISPLAY_NAME?.trim() || "Zuidlaren Agenda beheerder";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

const configuredAdminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

if (!configuredAdminEmail) {
  throw new Error("ADMIN_EMAIL is required");
}

const adminEmail: string = configuredAdminEmail;

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const user = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      disabledAt: null,
      displayName: adminDisplayName,
      isAdmin: true,
    },
    create: {
      email: adminEmail,
      displayName: adminDisplayName,
      isAdmin: true,
      locale: "nl-NL",
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "operator.admin.ensure",
      targetId: user.id,
      targetType: "user",
      metadata: {
        email: adminEmail,
        source: "scripts/ensure-admin.ts",
      },
    },
  });

  logInfo("operator.admin.ensure.succeeded", { email: user.email, userId: user.id });
}

main()
  .catch((error) => {
    logError("operator.admin.ensure.failed", { error });
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
