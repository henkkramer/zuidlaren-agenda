import { parseBusinessActivityPayload } from "@/lib/business-activity-input";

export type ActivityImportPreviewRow = {
  errors: string[];
  rowNumber: number;
  status: "draft" | "invalid";
  title: string;
  warnings: string[];
};

const requiredColumns = ["title", "startAt", "endAt", "locationName", "shortDescription", "description"];
const supportedDelimiters = ["\t", ";", "|", ","];

function splitLine(line: string, delimiter: string) {
  return line.split(delimiter).map((part) => part.trim());
}

function chooseDelimiter(header: string) {
  return supportedDelimiters
    .map((delimiter) => ({ delimiter, count: header.split(delimiter).length }))
    .sort((a, b) => b.count - a.count)[0]?.delimiter ?? ",";
}

function withoutEmptyValues(payload: Record<string, string>) {
  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value.trim())) as Record<string, string>;
}

export function parseActivityImportPreview(input: string): ActivityImportPreviewRow[] {
  const lines = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  const delimiter = chooseDelimiter(lines[0]);
  const headers = splitLine(lines[0], delimiter);
  const rows = lines.slice(1);

  return rows.map((line, index) => {
    const values = splitLine(line, delimiter);
    const payload = Object.fromEntries(headers.map((header, headerIndex) => [header, values[headerIndex] ?? ""])) as Record<string, string>;
    const cleanedPayload = withoutEmptyValues(payload);
    const warnings = requiredColumns.filter((column) => !payload[column]).map((column) => `${column} ontbreekt`);

    if (!payload.sourceUrl) warnings.push("sourceUrl ontbreekt; standaard bron wordt gebruikt");
    if (!payload.category) warnings.push("category ontbreekt; cultuur wordt gebruikt");

    try {
      const parsed = parseBusinessActivityPayload(
        {
          ...cleanedPayload,
          typeTags: cleanedPayload.typeTags,
        },
        cleanedPayload.organizerName || "Import",
      );

      return {
        errors: [],
        rowNumber: index + 2,
        status: "draft" as const,
        title: parsed.title,
        warnings,
      };
    } catch (error) {
      return {
        errors: [error instanceof Error ? error.message : "Rij kon niet worden verwerkt"],
        rowNumber: index + 2,
        status: "invalid" as const,
        title: payload.title || `Rij ${index + 2}`,
        warnings,
      };
    }
  });
}
