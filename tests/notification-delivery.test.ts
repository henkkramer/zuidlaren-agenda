import assert from "node:assert/strict";
import { test } from "node:test";
import { buildCampaignEmailMessage, summarizeDeliveryAttempts } from "@/lib/notification-delivery";

test("campaign email message includes campaign and opt-in context", () => {
  const message = buildCampaignEmailMessage({
    businessName: "Grand Cafe Zuidlaren",
    campaignTitle: "Open Podium",
    message: "Vanavond muziek op de Brink.",
    recipientEmail: "bewoner@example.nl",
  });

  assert.equal(message.to, "bewoner@example.nl");
  assert.equal(message.subject, "Zuidlaren Agenda: Open Podium");
  assert.match(message.text, /Grand Cafe Zuidlaren/);
  assert.match(message.text, /updates van lokale organisaties/);
});

test("delivery attempt summary counts sent and failed attempts", () => {
  assert.deepEqual(summarizeDeliveryAttempts([{ ok: true }, { ok: false }, { ok: true }]), {
    failed: 1,
    sent: 2,
    total: 3,
  });
});
