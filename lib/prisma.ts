import "server-only";

import { PrismaClient, type Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { logWarn } from "@/lib/structured-log";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaQueryLoggerAttached?: boolean;
};

const slowQueryThresholdMs = 100;
const repeatedQueryThreshold = 5;
const queryCounts = new Map<string, number>();

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is required");
  }

  const adapter = new PrismaPg({ connectionString });
  const log = process.env.NODE_ENV === "production" ? [] : [{ emit: "event", level: "query" } satisfies Prisma.LogDefinition];
  return new PrismaClient({ adapter, log });
}

function normalizeQuery(query: string) {
  return query.replace(/\s+/g, " ").trim().slice(0, 240);
}

function attachQueryLogger(client: PrismaClient) {
  if (process.env.NODE_ENV === "production" || globalForPrisma.prismaQueryLoggerAttached) {
    return;
  }

  const queryEventClient = client as unknown as {
    $on(event: "query", callback: (event: { duration: number; query: string; target?: string }) => void): void;
  };

  queryEventClient.$on("query", (event) => {
    const query = normalizeQuery(event.query);
    const count = (queryCounts.get(query) ?? 0) + 1;
    queryCounts.set(query, count);

    if (event.duration > slowQueryThresholdMs) {
      logWarn("prisma.slow_query", {
        durationMs: event.duration,
        target: event.target,
        query,
      });
    }

    if (count === repeatedQueryThreshold) {
      logWarn("prisma.repeated_query", {
        count,
        query,
      });
    }
  });

  globalForPrisma.prismaQueryLoggerAttached = true;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

attachQueryLogger(prisma);

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
