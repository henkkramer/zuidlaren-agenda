import assert from "node:assert/strict";
import { test } from "node:test";
import { parseNotificationCampaignInput } from "@/lib/notification-campaign-input";

test("notification campaign input trims and caps fields", () => {
  const input = parseNotificationCampaignInput({
    activityId: ` ${"a".repeat(90)} `,
    message: ` ${"m".repeat(1200)} `,
    title: ` ${"t".repeat(140)} `,
  });

  assert.equal(input.activityId.length, 80);
  assert.equal(input.message.length, 1000);
  assert.equal(input.title.length, 120);
});

test("notification campaign input rejects short title or message", () => {
  assert.throws(() => parseNotificationCampaignInput({ title: "Kort", message: "Dit bericht is lang genoeg" }), /Titel en bericht/);
  assert.throws(() => parseNotificationCampaignInput({ title: "Goede titel", message: "te kort" }), /Titel en bericht/);
});

test("notification campaign input allows optional activity", () => {
  assert.deepEqual(
    parseNotificationCampaignInput({
      message: "Dit is een volledig bericht voor een campagne.",
      title: "Campagne",
    }),
    {
      activityId: "",
      message: "Dit is een volledig bericht voor een campagne.",
      title: "Campagne",
    },
  );
});
