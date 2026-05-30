import { NextResponse } from "next/server";
import { createAdminAuditLog, requireAdmin } from "@/lib/admin-auth";
import { getActivityScannerPromptTemplate, updateActivityScannerPromptTemplate } from "@/lib/ai-activity-prompt";
import { rejectCrossOriginMutation } from "@/lib/csrf";
import { accessDeniedResponse, badRequestResponse } from "@/lib/route-helpers";

type PromptPayload = {
  prompt?: unknown;
};

export async function GET() {
  const admin = await requireAdmin();

  if (!admin.ok) {
    return accessDeniedResponse(admin);
  }

  const template = await getActivityScannerPromptTemplate();
  return NextResponse.json({
    prompt: {
      id: template.id,
      key: template.key,
      prompt: template.prompt,
      title: template.title,
      updatedAt: template.updatedAt,
      version: template.version,
    },
  });
}

export async function PATCH(request: Request) {
  const csrfResponse = rejectCrossOriginMutation(request);
  if (csrfResponse) return csrfResponse;

  const admin = await requireAdmin();

  if (!admin.ok) {
    return accessDeniedResponse(admin);
  }

  const payload = ((await request.json().catch(() => null)) ?? {}) as PromptPayload;

  try {
    const template = await updateActivityScannerPromptTemplate(payload.prompt);

    await createAdminAuditLog({
      actorId: admin.userId,
      action: "admin.activity_scan_prompt.update",
      targetType: "AiPromptTemplate",
      targetId: template.id,
      metadata: { key: template.key, version: template.version },
    });

    return NextResponse.json({ prompt: template });
  } catch (error) {
    return badRequestResponse(error instanceof Error ? error.message : "Scanprompt kon niet worden opgeslagen");
  }
}
