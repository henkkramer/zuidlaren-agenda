export type NotificationCampaignInput = {
  activityId: string;
  message: string;
  title: string;
};

function text(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export function parseNotificationCampaignInput(payload: Record<string, unknown>): NotificationCampaignInput {
  const title = text(payload.title, 120);
  const message = text(payload.message, 1000);
  const activityId = text(payload.activityId, 80);

  if (title.length < 5 || message.length < 20) {
    throw new Error("Titel en bericht zijn verplicht");
  }

  return {
    activityId,
    message,
    title,
  };
}
