import { deriveActivityScannerOperations } from "@/lib/ai-activity-operations-rules";
import { prisma } from "@/lib/prisma";

export { deriveActivityScannerOperations };
export type {
  ActivityScannerLatestRun,
  ActivityScannerOperationSource,
  ActivityScannerOperations,
  ActivityScannerStatusCount,
} from "@/lib/ai-activity-operations-rules";

export async function getFailedActivityScanSourceIds() {
  const sources = await prisma.activityScanSource.findMany({ where: { enabled: true }, select: { id: true } });
  const runs = await prisma.activityScanRun.findMany({
    orderBy: { startedAt: "desc" },
    select: { sourceId: true, status: true },
    take: 100,
  });
  const latestStatusBySource = new Map<string, string>();

  for (const run of runs) {
    if (!latestStatusBySource.has(run.sourceId)) {
      latestStatusBySource.set(run.sourceId, run.status);
    }
  }

  return sources.filter((source) => latestStatusBySource.get(source.id) === "FAILED").map((source) => source.id);
}

export async function getActivityScannerOperations() {
  const [sources, latestRuns, runStatusCounts, candidateStatusCounts] = await Promise.all([
    prisma.activityScanSource.findMany({ select: { id: true, name: true, enabled: true, lastScannedAt: true } }),
    prisma.activityScanRun.findMany({
      orderBy: { startedAt: "desc" },
      select: { error: true, source: { select: { name: true } }, sourceId: true, startedAt: true, status: true },
      take: 100,
    }),
    prisma.activityScanRun.groupBy({ by: ["status"], _count: true }),
    prisma.activityScanCandidate.groupBy({ by: ["status"], _count: true }),
  ]);

  return deriveActivityScannerOperations({
    candidateStatusCounts: candidateStatusCounts.map((row) => ({ count: row._count, status: row.status })),
    latestRuns: latestRuns.map((run) => ({
      error: run.error,
      sourceId: run.sourceId,
      sourceName: run.source.name,
      startedAt: run.startedAt,
      status: run.status,
    })),
    runStatusCounts: runStatusCounts.map((row) => ({ count: row._count, status: row.status })),
    sources,
  });
}
