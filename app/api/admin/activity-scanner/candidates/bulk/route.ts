import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { approveScanCandidate, rejectScanCandidate } from "@/lib/ai-activity-scanner-review";
import { rejectCrossOriginMutation } from "@/lib/csrf";
import { accessDeniedResponse, badRequestResponse } from "@/lib/route-helpers";

type BulkCandidatePatchPayload = {
  action?: unknown;
  candidateIds?: unknown;
  reason?: unknown;
};

export async function PATCH(request: Request) {
  const csrfResponse = rejectCrossOriginMutation(request);
  if (csrfResponse) return csrfResponse;

  const admin = await requireAdmin();

  if (!admin.ok) {
    return accessDeniedResponse(admin);
  }

  const payload = ((await request.json().catch(() => null)) ?? {}) as BulkCandidatePatchPayload;
  const action = typeof payload.action === "string" ? payload.action : "";
  const candidateIds = Array.isArray(payload.candidateIds)
    ? payload.candidateIds.filter((candidateId): candidateId is string => typeof candidateId === "string").slice(0, 25)
    : [];
  const reason = typeof payload.reason === "string" ? payload.reason : "";

  if (!candidateIds.length) {
    return badRequestResponse("Selecteer minimaal een scanvoorstel");
  }

  if (!["approve", "reject"].includes(action)) {
    return badRequestResponse("Ongeldige bulkactie");
  }

  try {
    const results = [];
    for (const candidateId of candidateIds) {
      results.push(action === "approve" ? await approveScanCandidate(candidateId, admin.userId) : await rejectScanCandidate(candidateId, admin.userId, reason));
    }

    return NextResponse.json({ results });
  } catch (error) {
    return badRequestResponse(error instanceof Error ? error.message : "Bulkactie kon niet worden verwerkt");
  }
}
