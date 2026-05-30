import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { approveScanCandidate, rejectScanCandidate } from "@/lib/ai-activity-scanner-review";
import { rejectCrossOriginMutation } from "@/lib/csrf";
import { accessDeniedResponse, badRequestResponse } from "@/lib/route-helpers";

type CandidateContext = {
  params: Promise<{
    candidateId: string;
  }>;
};

type CandidatePatchPayload = {
  action?: unknown;
  reason?: unknown;
};

export async function PATCH(request: Request, context: CandidateContext) {
  const csrfResponse = rejectCrossOriginMutation(request);
  if (csrfResponse) return csrfResponse;

  const admin = await requireAdmin();

  if (!admin.ok) {
    return accessDeniedResponse(admin);
  }

  const { candidateId } = await context.params;
  const payload = ((await request.json().catch(() => null)) ?? {}) as CandidatePatchPayload;
  const action = typeof payload.action === "string" ? payload.action : "";

  try {
    if (action === "approve") {
      const result = await approveScanCandidate(candidateId, admin.userId);
      return NextResponse.json(result);
    }

    if (action === "reject") {
      const reason = typeof payload.reason === "string" ? payload.reason : "";
      const result = await rejectScanCandidate(candidateId, admin.userId, reason);
      return NextResponse.json(result);
    }
  } catch (error) {
    return badRequestResponse(error instanceof Error ? error.message : "Scanvoorstel kon niet worden verwerkt");
  }

  return badRequestResponse("Ongeldige scanactie");
}
