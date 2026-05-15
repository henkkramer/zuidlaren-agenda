import type { EmailMessage } from "@/lib/email-provider";

export type CampaignDeliveryMessageInput = {
  businessName: string;
  campaignTitle: string;
  message: string;
  recipientEmail: string;
};

export type DeliveryAttemptSummary = {
  failed: number;
  sent: number;
  total: number;
};

export function buildCampaignEmailMessage(input: CampaignDeliveryMessageInput): EmailMessage {
  return {
    to: input.recipientEmail,
    subject: `Zuidlaren Agenda: ${input.campaignTitle}`,
    text: `${input.message}\n\nAfzender: ${input.businessName}\nJe ontvangt dit omdat je updates van lokale organisaties hebt ingeschakeld.`,
  };
}

export function summarizeDeliveryAttempts(attempts: Array<{ ok: boolean }>): DeliveryAttemptSummary {
  const sent = attempts.filter((attempt) => attempt.ok).length;
  return {
    failed: attempts.length - sent,
    sent,
    total: attempts.length,
  };
}
