import { NextResponse } from "next/server";
import { createAdminAuditLog, requireAdmin } from "@/lib/admin-auth";
import { getEmailProvider } from "@/lib/email-provider";
import { prisma } from "@/lib/prisma";

type AdminNotificationCampaignContext = {
  params: Promise<{
    campaignId: string;
  }>;
};

export async function POST(_request: Request, context: AdminNotificationCampaignContext) {
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
      _count: { select: { deliveries: true } },
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
      provider: provider.name,
    },
  });

  return NextResponse.json({
    campaign: {
      id: campaign.id,
      status: campaign.status.toLowerCase(),
      deliveryCount: campaign._count.deliveries,
    },
  });
}
