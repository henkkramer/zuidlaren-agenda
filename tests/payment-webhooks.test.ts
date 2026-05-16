import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { test } from "node:test";
import {
  mollieWebhookAuditMetadata,
  normalizeMollieWebhookEvent,
  summarizeWebhookPayload,
  verifyMollieWebhookSignature,
} from "@/lib/payment-webhooks";

test("mollie webhook signature verification accepts prefixed and raw HMAC signatures", () => {
  const body = JSON.stringify({ id: "evt_123", type: "payment.paid" });
  const secret = "test-secret";
  const signature = createHmac("sha256", secret).update(body).digest("hex");

  assert.equal(verifyMollieWebhookSignature({ body, secret, signature }), true);
  assert.equal(verifyMollieWebhookSignature({ body, secret, signature: `sha256=${signature}` }), true);
});

test("mollie webhook signature verification rejects missing or malformed signatures", () => {
  const body = JSON.stringify({ id: "evt_123" });

  assert.equal(verifyMollieWebhookSignature({ body, secret: "test-secret", signature: null }), false);
  assert.equal(verifyMollieWebhookSignature({ body, secret: undefined, signature: "abc" }), false);
  assert.equal(verifyMollieWebhookSignature({ body, secret: "test-secret", signature: "not-hex" }), false);
});

test("mollie webhook event normalization is deterministic for valid and invalid payloads", () => {
  const valid = normalizeMollieWebhookEvent(JSON.stringify({ id: "evt_123", type: "payment.paid", resource: "payment" }), "fallback-id");
  assert.equal(valid.eventId, "evt_123");
  assert.equal(valid.eventType, "payment.paid");
  assert.deepEqual(valid.payloadSummary, { id: "evt_123", type: "payment.paid", resource: "payment" });

  const invalid = normalizeMollieWebhookEvent("{", "fallback-id");
  assert.equal(invalid.eventId, "fallback-id");
  assert.equal(invalid.eventType, "invalid_json");
});

test("mollie webhook payload summary truncates provider-controlled strings", () => {
  const long = "x".repeat(200);
  const summary = summarizeWebhookPayload({ id: long, type: long, resource: long });

  assert.equal(summary.id?.length, 120);
  assert.equal(summary.type?.length, 120);
  assert.equal(summary.resource?.length, 120);
});

test("mollie webhook audit metadata is constrained", () => {
  assert.deepEqual(
    mollieWebhookAuditMetadata({
      eventId: "evt_123",
      eventType: "payment.paid",
      signatureValid: true,
      status: "RECEIVED",
    }),
    {
      eventId: "evt_123",
      eventType: "payment.paid",
      provider: "mollie",
      signatureValid: true,
      status: "RECEIVED",
    },
  );
});
