export type AnalyticsMetricGroupRow = {
  _sum: {
    count: number | null;
  };
  dimensionsKey: string;
};

function calendarExportKind(dimensionsKey: string) {
  const kindPart = dimensionsKey.split("|").find((part) => part.startsWith("kind:"));
  return kindPart?.slice("kind:".length) || "unknown";
}

export function summarizeCalendarExportBreakdown(rows: AnalyticsMetricGroupRow[]) {
  return rows
    .map((row) => ({
      count: row._sum.count ?? 0,
      kind: calendarExportKind(row.dimensionsKey),
    }))
    .filter((row) => row.count > 0)
    .sort((left, right) => right.count - left.count || left.kind.localeCompare(right.kind));
}
