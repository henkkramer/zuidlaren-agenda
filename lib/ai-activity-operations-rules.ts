export type ActivityScannerOperationSource = {
  enabled: boolean;
  id: string;
  lastScannedAt: Date | string | null;
  name: string;
};

export type ActivityScannerLatestRun = {
  error: string | null;
  sourceId: string;
  sourceName: string;
  startedAt: Date | string;
  status: string;
};

export type ActivityScannerStatusCount = {
  count: number;
  status: string;
};

export type ActivityScannerOperations = {
  checklist: Array<{ done: boolean; label: string }>;
  dueSourceCount: number;
  failedSourceCount: number;
  failedSources: Array<{ error: string | null; id: string; name: string; startedAt: string }>;
  lastCompletedRunAt: string | null;
  nextWeeklyScanAt: string | null;
  pendingReviewCount: number;
  runStatusCounts: ActivityScannerStatusCount[];
  staleSources: Array<{ id: string; lastScannedAt: string | null; name: string }>;
};

const weeklyScanIntervalMs = 7 * 24 * 60 * 60 * 1000;

function toDate(value: Date | string | null) {
  return value ? new Date(value) : null;
}

function iso(value: Date | string | null) {
  return toDate(value)?.toISOString() ?? null;
}

export function deriveActivityScannerOperations(input: {
  candidateStatusCounts: ActivityScannerStatusCount[];
  latestRuns: ActivityScannerLatestRun[];
  now?: Date;
  runStatusCounts: ActivityScannerStatusCount[];
  sources: ActivityScannerOperationSource[];
}): ActivityScannerOperations {
  const now = input.now ?? new Date();
  const enabledSources = input.sources.filter((source) => source.enabled);
  const latestRunBySource = new Map<string, ActivityScannerLatestRun>();

  for (const run of input.latestRuns) {
    if (!latestRunBySource.has(run.sourceId)) {
      latestRunBySource.set(run.sourceId, run);
    }
  }

  const staleSources = enabledSources
    .filter((source) => {
      const lastScannedAt = toDate(source.lastScannedAt);
      return !lastScannedAt || now.getTime() - lastScannedAt.getTime() >= weeklyScanIntervalMs;
    })
    .map((source) => ({ id: source.id, lastScannedAt: iso(source.lastScannedAt), name: source.name }));

  const failedSources = enabledSources
    .map((source) => ({ source, latestRun: latestRunBySource.get(source.id) }))
    .filter((item): item is { latestRun: ActivityScannerLatestRun; source: ActivityScannerOperationSource } => item.latestRun?.status === "FAILED")
    .map((item) => ({
      error: item.latestRun.error,
      id: item.source.id,
      name: item.source.name,
      startedAt: new Date(item.latestRun.startedAt).toISOString(),
    }));

  const completedRuns = input.latestRuns
    .filter((run) => run.status === "COMPLETED")
    .map((run) => new Date(run.startedAt))
    .sort((left, right) => right.getTime() - left.getTime());
  const lastCompletedRunAt = completedRuns[0]?.toISOString() ?? null;
  const nextWeeklyScanAt = lastCompletedRunAt ? new Date(new Date(lastCompletedRunAt).getTime() + weeklyScanIntervalMs).toISOString() : null;
  const pendingReviewCount = input.candidateStatusCounts
    .filter((row) => row.status === "PENDING" || row.status === "NEEDS_REVIEW" || row.status === "DUPLICATE")
    .reduce((sum, row) => sum + row.count, 0);

  return {
    checklist: [
      { done: enabledSources.length > 0, label: "Bronnenlijst actief" },
      { done: staleSources.length === 0, label: "Alle actieve bronnen deze week gescand" },
      { done: failedSources.length === 0, label: "Geen mislukte bronnen open" },
      { done: pendingReviewCount === 0, label: "Reviewlijst leeg" },
    ],
    dueSourceCount: staleSources.length,
    failedSourceCount: failedSources.length,
    failedSources,
    lastCompletedRunAt,
    nextWeeklyScanAt,
    pendingReviewCount,
    runStatusCounts: input.runStatusCounts,
    staleSources,
  };
}

