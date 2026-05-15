import { NextResponse } from "next/server";
import { normalizeMollieWebhookEvent, verifyMollieWebhookSignature } from "@/lib/payment-webhooks";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.text();
  const secret = process.env.MOLLIE_WEBHOOK_SECRET;
  const signature = request.headers.get("x-mollie-signature");
  const signatureValid = verifyMollieWebhookSignature({ body, signature, secret });
  const { eventId, eventType, payloadSummary } = normalizeMollieWebhookEvent(body, `unidentified-${Date.now().toString(36)}`);

  if (!secret || !signatureValid) {
    await prisma.webhookEventLog.upsert({
      where: {
        provider_eventId: {
          provider: "mollie",
          eventId,
        },
      },
      update: {
        status: "REJECTED",
        signatureValid: false,
        error: "Mollie webhook signature missing or invalid",
        payloadSummary,
      },
      create: {
        provider: "mollie",
        eventId,
        eventType,
        status: "REJECTED",
        signatureValid: false,
        error: "Mollie webhook signature missing or invalid",
        payloadSummary,
      },
    });

    return NextResponse.json({ error: "Webhook signature invalid" }, { status: 401 });
  }

  const existing = await prisma.webhookEventLog.findUnique({
    where: {
      provider_eventId: {
        provider: "mollie",
        eventId,
      },
    },
  });

  if (existing) {
    await prisma.webhookEventLog.update({
      where: { id: existing.id },
      data: { status: "DUPLICATE", signatureValid: true },
    });
    return NextResponse.json({ ok: true, duplicate: true });
  }

  await prisma.webhookEventLog.create({
    data: {
      provider: "mollie",
      eventId,
      eventType,
      status: "RECEIVED",
      signatureValid: true,
      payloadSummary,
    },
  });

  return NextResponse.json({ ok: true });
}
