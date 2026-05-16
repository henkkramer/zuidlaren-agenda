import { NextResponse } from "next/server";
import { requireBusinessPermission } from "@/lib/business-permissions";
import { createNotificationRequestAuditLog } from "@/lib/notification-audit";
import { findCampaignRecipients, hasRecentBusinessCampaign } from "@/lib/notification-campaigns";
import { parseNotificationCampaignInput } from "@/lib/notification-campaign-input";
import { rejectCrossOriginMutation } from "@/lib/csrf";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

type NotificationRecipient = {
  id: string;
};

type BusinessNotificationCampaignContext = {
  params: Promise<{
    businessId: string;
  }>;
};

export async function POST(request: Request, context: BusinessNotificationCampaignContext) {
  const csrfResponse = rejectCrossOriginMutation(request);
  if (csrfResponse) return csrfResponse;

  const { businessId } = await context.params;
  const access = await requireBusinessPermission(businessId, "publishActivities");

  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  const rateLimit = checkRateLimit({ key: `notification:${access.userId}:${access.business.id}`, limit: 5, windowMs: 60 * 60_000 });
  if (rateLimit.limited) {
    const response = rateLimitResponse(rateLimit.resetAt);
    return NextResponse.json(response.body, response.init);
  }

  let input;

  try {
    input = parseNotificationCampaignInput(((await request.json().catch(() => null)) ?? {}) as Record<string, unknown>);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Ongeldige notificatie-aanvraag" }, { status: 400 });
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const isRateLimited = await hasRecentBusinessCampaign(access.business.id, sevenDaysAgo);

  if (isRateLimited) {
    return NextResponse.json({ error: "Er staat al een recente notificatie-aanvraag voor dit bedrijf open" }, { status: 429 });
  }

  const activity = input.activityId
    ? await prisma.activity.findFirst({
        where: {
          id: input.activityId,
          businessId: access.business.id,
        },
        include: {
          category: true,
          location: true,
        },
      })
    : null;

  if (input.activityId && !activity) {
    return NextResponse.json({ error: "Activiteit niet gevonden voor dit bedrijf" }, { status: 404 });
  }

  const recipients = await findCampaignRecipients(activity);
  const campaign = await prisma.notificationCampaign.create({
    data: {
      title: input.title,
      message: input.message,
      status: "PENDING",
      targetCategory: activity?.category.slug,
      targetLocation: activity?.location.slug,
      businessId: access.business.id,
      activityId: activity?.id,
      requestedById: access.userId,
      deliveries: {
        create: (recipients as NotificationRecipient[]).map((recipient) => ({
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
