import { NextResponse } from "next/server";
import { isAiActivityAction, type AiActivityInput, type AiActivitySuggestion } from "@/lib/ai-card-assistant-types";
import { estimateTokens, localAiCardAssistantProvider } from "@/lib/ai-card-assistant";
import { requireBusinessPermission } from "@/lib/business-permissions";
import { prisma } from "@/lib/prisma";

type AiActivityAssistContext = {
  params: Promise<{
    businessId: string;
  }>;
};

type AiActivityAssistPayload = {
  action?: unknown;
  activity?: AiActivityInput;
};

const maxPayloadLength = 4000;

function cap(value?: string) {
  return (value ?? "").slice(0, 1200);
}

function sanitizeActivityInput(input: AiActivityInput | undefined, organizerName: string): AiActivityInput {
  const capped: AiActivityInput = {
    title: cap(input?.title),
    shortDescription: cap(input?.shortDescription),
    description: cap(input?.description),
    locationName: cap(input?.locationName),
    address: cap(input?.address),
    category: input?.category,
    typeTags: cap(input?.typeTags),
    startAt: cap(input?.startAt),
    endAt: cap(input?.endAt),
    sourceUrl: cap(input?.sourceUrl),
    organizerName: organizerName.slice(0, 240),
  };
  const serialized = JSON.stringify(capped);

  if (serialized.length > maxPayloadLength) {
    throw new Error("Invoer is te lang voor AI-hulp");
  }

  return capped;
}

function summarizeInput(activity: AiActivityInput) {
  return [activity.title, activity.shortDescription, activity.locationName].filter(Boolean).join(" | ").slice(0, 500);
}

function summarizeOutput(suggestion?: AiActivitySuggestion) {
  return [
    suggestion?.fields?.title,
    suggestion?.fields?.shortDescription,
    suggestion?.fields?.category,
    suggestion?.bannerPrompt,
    ...(suggestion?.notes ?? []),
  ]
    .filter(Boolean)
    .join(" | ")
    .slice(0, 500);
}

async function getPromptTemplate(action: string) {
  return prisma.aiPromptTemplate.upsert({
    where: {
      key_version: {
        key: `activity-assist.${action}`,
        version: 1,
      },
    },
    update: {
      active: true,
    },
    create: {
      key: `activity-assist.${action}`,
      version: 1,
      title: `Activity assist: ${action}`,
      prompt: "Help a Zuidlaren business improve an activity card. Return review-only suggestions; never publish or save content.",
      active: true,
    },
  });
}

export async function POST(request: Request, context: AiActivityAssistContext) {
  const { businessId } = await context.params;
  const access = await requireBusinessPermission(businessId);

  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  let payload: AiActivityAssistPayload;
  let activity: AiActivityInput;

  try {
    payload = (await request.json()) as AiActivityAssistPayload;
    activity = sanitizeActivityInput(payload.activity, access.business.name);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Ongeldige AI-aanvraag" }, { status: 400 });
  }

  const action = payload.action;

  if (!isAiActivityAction(action)) {
    return NextResponse.json({ error: "Onbekende AI-actie" }, { status: 400 });
  }

  const promptTemplate = await getPromptTemplate(action);
  const featureFlag = await prisma.featureFlag.findUnique({
    where: { key: "ai_card_assistant" },
  });

  if (!featureFlag?.enabled) {
    await prisma.aiUsageLog.create({
      data: {
        action,
        provider: localAiCardAssistantProvider.name,
        status: "BLOCKED",
        inputTokens: estimateTokens(activity),
        inputSummary: summarizeInput(activity),
        error: "Feature flag ai_card_assistant disabled",
        userId: access.userId,
        businessId: access.business.id,
        promptTemplateId: promptTemplate.id,
      },
    });

    return NextResponse.json({ error: "AI-hulp is tijdelijk uitgeschakeld" }, { status: 403 });
  }

  try {
    const suggestion = await localAiCardAssistantProvider.assistActivity(action, activity);

    await prisma.aiUsageLog.create({
      data: {
        action,
        provider: localAiCardAssistantProvider.name,
        status: "SUCCEEDED",
        inputTokens: estimateTokens(activity),
        outputTokens: estimateTokens(suggestion),
        costCents: 0,
        inputSummary: summarizeInput(activity),
        outputSummary: summarizeOutput(suggestion),
        userId: access.userId,
        businessId: access.business.id,
        promptTemplateId: promptTemplate.id,
      },
    });

    return NextResponse.json({
      provider: localAiCardAssistantProvider.name,
      suggestion,
    });
  } catch (error) {
    await prisma.aiUsageLog.create({
      data: {
        action,
        provider: localAiCardAssistantProvider.name,
        status: "FAILED",
        inputTokens: estimateTokens(activity),
        inputSummary: summarizeInput(activity),
        error: error instanceof Error ? error.message : "AI-aanvraag mislukt",
        userId: access.userId,
        businessId: access.business.id,
        promptTemplateId: promptTemplate.id,
      },
    });

    return NextResponse.json({ error: "AI-aanvraag mislukt" }, { status: 500 });
  }
}
