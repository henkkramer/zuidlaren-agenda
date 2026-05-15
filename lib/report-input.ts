export type ReportInput = {
  activityId: string | null;
  details: string | null;
  reason: string;
};

const maxReasonLength = 120;
const maxDetailsLength = 1000;

export function parseReportInput(payload: Record<string, unknown>): ReportInput {
  const reason = typeof payload.reason === "string" ? payload.reason.trim() : "";
  const details = typeof payload.details === "string" ? payload.details.trim() : "";
  const activityId = typeof payload.activityId === "string" ? payload.activityId.trim() : "";

  if (reason.length < 3 || reason.length > maxReasonLength) {
    throw new Error("Reden moet 3 tot 120 tekens zijn");
  }

  if (details.length > maxDetailsLength) {
    throw new Error("Toelichting mag maximaal 1000 tekens zijn");
  }

  return {
    activityId: activityId || null,
    details: details || null,
    reason,
  };
}
