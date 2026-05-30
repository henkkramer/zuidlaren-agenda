import "server-only";

import { defaultActivityScanSources, normalizeScanCandidate } from "@/lib/ai-activity-scanner-rules";
import { getActivityDiscoveryProvider, type DiscoveredActivity } from "@/lib/ai-activity-discovery";
import { getActivityExtractionProvider } from "@/lib/ai-activity-extraction";
import { getActivityScannerPromptTemplate } from "@/lib/ai-activity-prompt";
import { scoreCandidateQuality } from "@/lib/ai-activity-quality";
import { fetchActivityScanSource } from "@/lib/ai-activity-source-fetcher";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";


function sourceKind(value: string | undefined) {
  const normalized = (value ?? "WEBSITE").toUpperCase();
  return ["WEBSITE", "GOVERNMENT", "SOCIAL", "RESTAURANT", "BAR", "OTHER"].includes(normalized) ? normalized as "WEBSITE" | "GOVERNMENT" | "SOCIAL" | "RESTAURANT" | "BAR" | "OTHER" : "WEBSITE";
}

function discoveredSourceSlug(url: string) {
  const parsed = new URL(url);
  const path = parsed.pathname.replace(/\/$/, "");
  return slugify(`discovered ${parsed.hostname}${path || " home"}`).slice(0, 90);
}

async function ensureDiscoveredScanSource(candidate: DiscoveredActivity) {
  const sourceUrl = candidate.discoveredSource?.url ?? candidate.sourceUrl;
  const parsed = new URL(sourceUrl);
  const name = candidate.discoveredSource?.name || parsed.hostname;

  return prisma.activityScanSource.upsert({
    where: { slug: discoveredSourceSlug(sourceUrl) },
    update: {
      baseUrl: sourceUrl,
      enabled: true,
      kind: sourceKind(candidate.discoveredSource?.kind),
      name,
      respectRobots: true,
    },
    create: {
      baseUrl: sourceUrl,
      enabled: true,
      kind: sourceKind(candidate.discoveredSource?.kind),
      name,
      respectRobots: true,
      slug: discoveredSourceSlug(sourceUrl),
    },
  });
}

async function createScanCandidate(candidate: Parameters<typeof normalizeScanCandidate>[0], scanRunId: string, sourceId: string) {
  const normalized = normalizeScanCandidate(candidate);
  const existing = await prisma.activityScanCandidate.findUnique({
    where: { canonicalKey: normalized.canonicalKey },
    select: { id: true },
  });

  if (existing) return false;

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
      scanRunId,
      shortDescription: normalized.shortDescription,
      sourceId,
      sourceUrl: normalized.sourceUrl,
      status: quality.suggestedStatus,
      startAt: normalized.startAt,
      title: normalized.title,
      typeTags: normalized.typeTags,
    },
  });

  return true;
}

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
      const candidateCreated = await createScanCandidate(candidate, run.id, source.id);
      if (candidateCreated) {
        created += 1;
      } else {
        skipped += 1;
      }
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


export async function runInternetActivityDiscovery(actorId: string) {
  const discoveryProvider = getActivityDiscoveryProvider();
  const promptTemplate = await getActivityScannerPromptTemplate();
  const discoveredCandidates = await discoveryProvider.discover(promptTemplate.prompt);
  const runSummaries: Array<{ source: string; created: number; discovered: number; fetchStatus: number | null; skipped: number }> = [];
  const grouped = new Map<string, DiscoveredActivity[]>();

  for (const candidate of discoveredCandidates) {
    const sourceUrl = candidate.discoveredSource?.url ?? candidate.sourceUrl;
    const key = discoveredSourceSlug(sourceUrl);
    grouped.set(key, [...(grouped.get(key) ?? []), candidate]);
  }

  for (const candidates of grouped.values()) {
    const source = await ensureDiscoveredScanSource(candidates[0]);
    const run = await prisma.activityScanRun.create({
      data: { actorId, completedAt: new Date(), sourceId: source.id, status: "COMPLETED" },
    });
    let created = 0;
    let skipped = 0;

    for (const candidate of candidates) {
      const candidateCreated = await createScanCandidate(candidate, run.id, source.id);
      if (candidateCreated) created += 1;
      else skipped += 1;
    }

    await prisma.activityScanRun.update({
      where: { id: run.id },
      data: {
        summary: {
          created,
          discoveryProvider: discoveryProvider.name,
          discovered: candidates.length,
          promptTemplateId: promptTemplate.id,
          promptTemplateVersion: promptTemplate.version,
          skipped,
        },
      },
    });
    await prisma.activityScanSource.update({ where: { id: source.id }, data: { lastScannedAt: new Date() } });
    runSummaries.push({ source: source.name, created, discovered: candidates.length, fetchStatus: null, skipped });
  }

  return runSummaries;
}
