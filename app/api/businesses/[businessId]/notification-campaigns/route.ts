import { NextResponse } from "next/server";
import { requireBusinessPermission } from "@/lib/business-permissions";
import { createNotificationRequestAuditLog } from "@/lib/notification-audit";
import { findCampaignRecipients, hasRecentBusinessCampaign } from "@/lib/notification-campaigns";
import { prisma } from "@/lib/prisma";

type BusinessNotificationCampaignContext = {
  params: Promise<{
    businessId: string;
  }>;
};

type CampaignPayload = {
  title?: unknown;
  message?: unknown;
  activityId?: unknown;
};

function text(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export async function POST(request: Request, context: BusinessNotificationCampaignContext) {
  const { businessId } = await context.params;
  const access = await requireBusinessPermission(businessId, "publishActivities");

  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  const payload = (await request.json().catch(() => null)) as CampaignPayload | null;
  const title = text(payload?.title, 120);
  const message = text(payload?.message, 1000);
  const activityId = text(payload?.activityId, 80);

  if (title.length < 5 || message.length < 20) {
    return NextResponse.json({ error: "Titel en bericht zijn verplicht" }, { status: 400 });
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const isRateLimited = await hasRecentBusinessCampaign(access.business.id, sevenDaysAgo);

  if (isRateLimited) {
    return NextResponse.json({ error: "Er staat al een recente notificatie-aanvraag voor dit bedrijf open" }, { status: 429 });
  }

  const activity = activityId
    ? await prisma.activity.findFirst({
        where: {
          id: activityId,
          businessId: access.business.id,
        },
        include: {
          category: true,
          location: true,
        },
      })
    : null;

  if (activityId && !activity) {
    return NextResponse.json({ error: "Activiteit niet gevonden voor dit bedrijf" }, { status: 404 });
  }

  const recipients = await findCampaignRecipients(activity);
  const campaign = await prisma.notificationCampaign.create({
    data: {
      title,
      message,
      status: "PENDING",
      targetCategory: activity?.category.slug,
      targetLocation: activity?.location.slug,
      businessId: access.business.id,
      activityId: activity?.id,
      requestedById: access.userId,
      deliveries: {
        create: recipients.map((recipient) => ({
          userId: recipient.id,
          status: "PENDING",
          channel: "email",
          provider: "pending-approval",
        })),
      },
    },
    include: {
      _count: {
        select: {
          deliveries: true,
        },
      },
    },
  });

  await createNotificationRequestAuditLog({
    actorId: access.userId,
    campaignId: campaign.id,
    businessId: access.business.id,
    deliveryCount: campaign._count.deliveries,
  });

  return NextResponse.json(
    {
      campaign: {
        id: campaign.id,
        status: campaign.status.toLowerCase(),
        deliveryCount: campaign._count.deliveries,
      },
    },
    { status: 201 },
  );
}
