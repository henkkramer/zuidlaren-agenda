import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const admin = await requireAdmin();

  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const campaigns = await prisma.notificationCampaign.findMany({
    include: {
      business: { select: { id: true, name: true, slug: true } },
      activity: { select: { id: true, title: true } },
      requestedBy: { select: { id: true, email: true, displayName: true } },
      approvedBy: { select: { id: true, email: true, displayName: true } },
      _count: { select: { deliveries: true } },
    },
    orderBy: [{ status: "asc" }, { requestedAt: "desc" }],
    take: 50,
  });

  return NextResponse.json({
    campaigns: campaigns.map((campaign) => ({
      id: campaign.id,
      title: campaign.title,
      message: campaign.message,
      status: campaign.status.toLowerCase(),
      business: campaign.business,
      activity: campaign.activity,
      requestedBy: campaign.requestedBy,
      approvedBy: campaign.approvedBy,
      deliveryCount: campaign._count.deliveries,
      requestedAt: campaign.requestedAt.toISOString(),
      approvedAt: campaign.approvedAt?.toISOString() ?? null,
    })),
  });
}
