import { NextResponse } from "next/server";
import { createAdminAuditLog, requireAdmin } from "@/lib/admin-auth";
import { rejectCrossOriginMutation } from "@/lib/csrf";
import { getEmailProvider } from "@/lib/email-provider";
import { buildCampaignEmailMessage, summarizeDeliveryAttempts } from "@/lib/notification-delivery";
import { prisma } from "@/lib/prisma";

type AdminNotificationCampaignContext = {
  params: Promise<{
    campaignId: string;
  }>;
};

export async function POST(request: Request, context: AdminNotificationCampaignContext) {
  const csrfResponse = rejectCrossOriginMutation(request);
  if (csrfResponse) return csrfResponse;

  const admin = await requireAdmin();

  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const { campaignId } = await context.params;
  const provider = getEmailProvider();
  const campaign = await prisma.notificationCampaign.update({
    where: { id: campaignId },
    data: {
      status: "APPROVED",
      approvedAt: new Date(),
      approvedById: admin.userId,
      deliveries: {
        updateMany: {
          where: { status: "PENDING" },
          data: {
            provider: provider.name,
          },
        },
      },
    },
    include: {
      business: { select: { name: true } },
      deliveries: {
        where: { status: "PENDING" },
        include: { user: { select: { email: true } } },
      },
      _count: { select: { deliveries: true } },
    },
  });

  const attempts = await Promise.all(
    campaign.deliveries.map(async (delivery: { id: string; user: { email: string } }) => {
      try {
        const result = await provider.send(
          buildCampaignEmailMessage({
            businessName: campaign.business.name,
            campaignTitle: campaign.title,
            message: campaign.message,
            recipientEmail: delivery.user.email,
          }),
        );
        await prisma.notificationDelivery.update({
          where: { id: delivery.id },
          data: {
            attemptedAt: new Date(),
            deliveredAt: new Date(),
            provider: provider.name,
            providerId: result.providerId,
            status: "SENT",
          },
        });
        return { ok: true };
      } catch (error) {
        await prisma.notificationDelivery.update({
          where: { id: delivery.id },
          data: {
            attemptedAt: new Date(),
            provider: provider.name,
            reason: error instanceof Error ? error.message.slice(0, 240) : "Verzenden mislukt",
            status: "FAILED",
          },
        });
        return { ok: false };
      }
    }),
  );
  const deliverySummary = summarizeDeliveryAttempts(attempts);
  const finalStatus = deliverySummary.failed === 0 ? "SENT" : "APPROVED";

  const updatedCampaign = await prisma.notificationCampaign.update({
    where: { id: campaign.id },
    data: {
      sentAt: deliverySummary.sent > 0 ? new Date() : null,
      status: finalStatus,
    },
  });

  await createAdminAuditLog({
    actorId: admin.userId,
    action: "notification_campaign.approve",
    targetType: "NotificationCampaign",
    targetId: campaign.id,
    metadata: {
      businessId: campaign.businessId,
      deliveryCount: campaign._count.deliveries,
      failed: deliverySummary.failed,
      provider: provider.name,
      sent: deliverySummary.sent,
    },
  });

  return NextResponse.json({
    campaign: {
      id: updatedCampaign.id,
      status: updatedCampaign.status.toLowerCase(),
      deliveryCount: campaign._count.deliveries,
      failed: deliverySummary.failed,
      sent: deliverySummary.sent,
    },
  });
}
