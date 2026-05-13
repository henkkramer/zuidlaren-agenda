import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

export function summarizeWebhookPayload(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return { kind: "unknown" };
  }

  const record = payload as Record<string, unknown>;
  return {
    id: typeof record.id === "string" ? record.id.slice(0, 120) : null,
    type: typeof record.type === "string" ? record.type.slice(0, 120) : null,
    resource: typeof record.resource === "string" ? record.resource.slice(0, 120) : null,
  };
}

export function verifyMollieWebhookSignature(input: {
  body: string;
  signature?: string | null;
  secret?: string;
}) {
  if (!input.secret || !input.signature) {
    return false;
  }

  const expected = createHmac("sha256", input.secret).update(input.body).digest("hex");
  const actual = input.signature.replace(/^sha256=/, "");

  try {
    return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(actual, "hex"));
  } catch {
    return false;
  }
}
