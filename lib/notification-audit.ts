import "server-only";

import { prisma } from "@/lib/prisma";

export async function createNotificationRequestAuditLog(input: {
  actorId: string;
  campaignId: string;
  businessId: string;
  deliveryCount: number;
}) {
  return prisma.auditLog.create({
    data: {
      actorId: input.actorId,
      action: "notification_campaign.request",
      targetType: "NotificationCampaign",
      targetId: input.campaignId,
      metadata: {
        businessId: input.businessId,
        deliveryCount: input.deliveryCount,
      },
    },
  });
}
