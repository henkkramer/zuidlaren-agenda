import "server-only";

import { defaultActivityScanSources, normalizeScanCandidate } from "@/lib/ai-activity-scanner-rules";
import { getActivityExtractionProvider } from "@/lib/ai-activity-extraction";
import { getActivityScannerPromptTemplate } from "@/lib/ai-activity-prompt";
import { scoreCandidateQuality } from "@/lib/ai-activity-quality";
import { fetchActivityScanSource } from "@/lib/ai-activity-source-fetcher";
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

export async function runLocalActivityScan(actorId: string, options: { sourceIds?: string[] } = {}) {
  await ensureDefaultScanSources();
  const extractionProvider = getActivityExtractionProvider();
  const promptTemplate = await getActivityScannerPromptTemplate();
  const runSummaries: Array<{ source: string; created: number; extracted: number; fetchStatus: number | null; skipped: number }> = [];
  const enabledSources = await prisma.activityScanSource.findMany({
    where: {
      enabled: true,
      ...(options.sourceIds?.length ? { id: { in: options.sourceIds } } : {}),
    },
    orderBy: { name: "asc" },
  });

  for (const source of enabledSources) {
    const fixture = defaultActivityScanSources.find((item) => item.slug === source.slug);
    const run = await prisma.activityScanRun.create({
      data: {
        actorId,
        sourceId: source.id,
        status: "RUNNING",
      },
    });

    const fetchResult = await fetchActivityScanSource(source.baseUrl);
    const extractedCandidates = fetchResult.error
      ? []
      : await extractionProvider.extractCandidates({
          contentType: fetchResult.contentType,
          fetchedAt: fetchResult.fetchedAt,
          sourceName: source.name,
          sourceUrl: source.baseUrl,
          textSample: fetchResult.textSample,
        }, promptTemplate.prompt);
    const scanCandidates = [...(fixture?.candidates ?? []), ...extractedCandidates];
    let created = 0;
    let skipped = 0;

    for (const candidate of scanCandidates) {
      const normalized = normalizeScanCandidate(candidate);
      const existing = await prisma.activityScanCandidate.findUnique({
        where: { canonicalKey: normalized.canonicalKey },
        select: { id: true },
      });

      if (existing) {
        skipped += 1;
        continue;
      }

      const duplicateWindowStart = new Date(normalized.startAt);
      duplicateWindowStart.setDate(duplicateWindowStart.getDate() - 1);
      const duplicateWindowEnd = new Date(normalized.startAt);
      duplicateWindowEnd.setDate(duplicateWindowEnd.getDate() + 1);
      const [existingActivities, existingCandidates] = await Promise.all([
        prisma.activity.findMany({
          where: { startAt: { gte: duplicateWindowStart, lte: duplicateWindowEnd } },
          select: { startAt: true, title: true },
          take: 30,
        }),
        prisma.activityScanCandidate.findMany({
          where: { startAt: { gte: duplicateWindowStart, lte: duplicateWindowEnd } },
          select: { startAt: true, status: true, title: true },
          take: 30,
        }),
      ]);
      const quality = scoreCandidateQuality({ candidate, existingActivities, existingCandidates });

      await prisma.activityScanCandidate.create({
        data: {
          aiNotes: normalized.aiNotes,
          canonicalKey: normalized.canonicalKey,
          categorySlug: normalized.categorySlug,
          confidence: normalized.confidence,
          duplicateReason: quality.duplicateReason,
          duplicateScore: quality.duplicateScore,
          description: normalized.description,
          endAt: normalized.endAt,
          expectedVisitors: normalized.expectedVisitors,
          imageUrl: normalized.imageUrl,
          indoorOutdoor: normalized.indoorOutdoor,
          locationName: normalized.locationName,
          address: normalized.address,
          organizerName: normalized.organizerName,
          qualityReasons: quality.qualityReasons,
          qualityScore: quality.qualityScore,
          rawEvidence: normalized.rawEvidence,
          scanRunId: run.id,
          shortDescription: normalized.shortDescription,
          sourceId: source.id,
          sourceUrl: normalized.sourceUrl,
          status: quality.suggestedStatus,
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
        bytesFetched: fetchResult.bytesFetched,
        completedAt: new Date(),
        contentType: fetchResult.contentType,
        error: fetchResult.error,
        fetchedAt: fetchResult.fetchedAt,
        fetchStatus: fetchResult.status,
        status: fetchResult.error ? "FAILED" : "COMPLETED",
        summary: {
          created,
          extracted: extractedCandidates.length,
          extractionProvider: extractionProvider.name,
          promptTemplateId: promptTemplate.id,
          promptTemplateVersion: promptTemplate.version,
          fixtureProvider: fixture ? "local-open-source-fixtures" : null,
          fetchError: fetchResult.error ?? null,
          skipped,
        },
      },
    });
    await prisma.activityScanSource.update({ where: { id: source.id }, data: { lastScannedAt: new Date() } });
    runSummaries.push({ source: source.name, created, extracted: extractedCandidates.length, fetchStatus: fetchResult.status, skipped });
  }

  return runSummaries;
}
