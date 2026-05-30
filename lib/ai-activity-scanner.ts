import "server-only";

import { defaultActivityScanSources, normalizeScanCandidate } from "@/lib/ai-activity-scanner-rules";
import { prisma } from "@/lib/prisma";

export async function ensureDefaultScanSources() {
  return Promise.all(
    defaultActivityScanSources.map((source) =>
      prisma.activityScanSource.upsert({
        where: { slug: source.slug },
        update: {
          baseUrl: source.baseUrl,
          enabled: true,
          kind: source.kind,
          name: source.name,
          respectRobots: true,
        },
        create: {
          baseUrl: source.baseUrl,
          enabled: true,
          kind: source.kind,
          name: source.name,
          respectRobots: true,
          slug: source.slug,
        },
      }),
    ),
  );
}

export async function runLocalActivityScan(actorId: string) {
  await ensureDefaultScanSources();
  const runSummaries: Array<{ source: string; created: number; skipped: number }> = [];

  for (const fixture of defaultActivityScanSources) {
    const source = await prisma.activityScanSource.findUniqueOrThrow({ where: { slug: fixture.slug } });
    const run = await prisma.activityScanRun.create({
      data: {
        actorId,
        sourceId: source.id,
        status: "RUNNING",
      },
    });

    let created = 0;
    let skipped = 0;

    for (const candidate of fixture.candidates) {
      const normalized = normalizeScanCandidate(candidate);
      const existing = await prisma.activityScanCandidate.findUnique({
        where: { canonicalKey: normalized.canonicalKey },
        select: { id: true },
      });

      if (existing) {
        skipped += 1;
        continue;
      }

      await prisma.activityScanCandidate.create({
        data: {
          aiNotes: normalized.aiNotes,
          canonicalKey: normalized.canonicalKey,
          categorySlug: normalized.categorySlug,
          confidence: normalized.confidence,
          description: normalized.description,
          endAt: normalized.endAt,
          expectedVisitors: normalized.expectedVisitors,
          imageUrl: normalized.imageUrl,
          indoorOutdoor: normalized.indoorOutdoor,
          locationName: normalized.locationName,
          address: normalized.address,
          organizerName: normalized.organizerName,
          rawEvidence: normalized.rawEvidence,
          scanRunId: run.id,
          shortDescription: normalized.shortDescription,
          sourceId: source.id,
          sourceUrl: normalized.sourceUrl,
          startAt: normalized.startAt,
          title: normalized.title,
          typeTags: normalized.typeTags,
        },
      });
      created += 1;
    }

    await prisma.activityScanRun.update({
      where: { id: run.id },
      data: {
        completedAt: new Date(),
        status: "COMPLETED",
        summary: { created, skipped, provider: "local-open-source-fixtures" },
      },
    });
    await prisma.activityScanSource.update({ where: { id: source.id }, data: { lastScannedAt: new Date() } });
    runSummaries.push({ source: source.name, created, skipped });
  }

  return runSummaries;
}
