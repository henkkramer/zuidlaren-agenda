export type AdminActivityStatus = "DRAFT" | "SCHEDULED" | "PUBLISHED" | "UNPUBLISHED" | "EXPIRED";
export type AdminBusinessStatus = "PENDING" | "APPROVED" | "SUSPENDED";
export type AdminReportStatus = "OPEN" | "REVIEWED" | "DISMISSED";

export function parseAdminActivityStatus(value: unknown): AdminActivityStatus | null {
  if (value === "draft") return "DRAFT";
  if (value === "scheduled") return "SCHEDULED";
  if (value === "published") return "PUBLISHED";
  if (value === "unpublished") return "UNPUBLISHED";
  if (value === "expired") return "EXPIRED";
  return null;
}

export function parseAdminBusinessStatus(value: unknown): AdminBusinessStatus | null {
  if (value === "pending") return "PENDING";
  if (value === "approved") return "APPROVED";
  if (value === "suspended") return "SUSPENDED";
  return null;
}

export function parseAdminReportStatus(value: unknown): AdminReportStatus | null {
  if (value === "open") return "OPEN";
  if (value === "reviewed") return "REVIEWED";
  if (value === "dismissed") return "DISMISSED";
  return null;
}

export function parseAdminReportResolution(value: unknown) {
  return typeof value === "string" ? value.trim() : undefined;
}
