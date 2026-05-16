import "server-only";

import { prisma } from "@/lib/prisma";

type RecentTransactionRow = {
  amountCents: number;
  business: { name: string };
  currency: string;
  description: string;
  id: string;
  status: string;
};

type RecentWebhookEventRow = {
  eventType: string;
  id: string;
  provider: string;
  receivedAt: Date;
  status: string;
};

export async function getBillingSummary() {
  const [
    customers,
    activeSubscriptions,
    openTransactions,
    paidTransactions,
    webhookEvents,
    recentTransactions,
    recentWebhookEvents,
  ] = await Promise.all([
    prisma.paymentCustomer.count(),
    prisma.paymentSubscription.count({ where: { status: "ACTIVE" } }),
    prisma.paymentTransaction.count({ where: { status: "PENDING" } }),
    prisma.paymentTransaction.aggregate({ where: { status: "PAID" }, _sum: { amountCents: true } }),
    prisma.webhookEventLog.count(),
    prisma.paymentTransaction.findMany({
      include: { business: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.webhookEventLog.findMany({
      orderBy: { receivedAt: "desc" },
      take: 6,
    }),
  ]);

  return {
    customers,
    activeSubscriptions,
    openTransactions,
    paidAmountCents: paidTransactions._sum.amountCents ?? 0,
    webhookEvents,
    recentTransactions: (recentTransactions as RecentTransactionRow[]).map((transaction) => ({
      id: transaction.id,
      businessName: transaction.business.name,
      description: transaction.description,
      status: transaction.status.toLowerCase(),
      amountCents: transaction.amountCents,
      currency: transaction.currency,
    })),
    recentWebhookEvents: (recentWebhookEvents as RecentWebhookEventRow[]).map((event) => ({
      id: event.id,
      provider: event.provider,
      eventType: event.eventType,
      status: event.status.toLowerCase(),
      receivedAt: event.receivedAt.toISOString(),
    })),
  };
}
