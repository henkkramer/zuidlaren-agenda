import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { requireBusinessPermission } from "@/lib/business-permissions";
import { rejectCrossOriginMutation } from "@/lib/csrf";
import { storeLocalMedia } from "@/lib/media-storage";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const csrfResponse = rejectCrossOriginMutation(request);
  if (csrfResponse) return csrfResponse;

  const session = await getCurrentSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const rateLimit = checkRateLimit({ key: `media:${session.user.id}`, limit: 20, windowMs: 60 * 60_000 });
  if (rateLimit.limited) {
    const response = rateLimitResponse(rateLimit.resetAt);
    return NextResponse.json(response.body, response.init);
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const businessId = formData.get("businessId");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Afbeelding is verplicht" }, { status: 400 });
  }

  let resolvedBusinessId: string | undefined;

  if (typeof businessId === "string" && businessId.trim()) {
    const access = await requireBusinessPermission(businessId);

    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    resolvedBusinessId = access.business.id;
  }

  try {
    const storedFile = await storeLocalMedia(file);
    const mediaAsset = await prisma.mediaAsset.create({
      data: {
        filename: storedFile.filename,
        originalName: file.name,
        mimeType: storedFile.mimeType,
        sizeBytes: storedFile.sizeBytes,
        width: storedFile.width,
        height: storedFile.height,
        storageKey: storedFile.storageKey,
        publicUrl: storedFile.publicUrl,
        ownerUserId: session.user.id,
        businessId: resolvedBusinessId,
      },
    });

    return NextResponse.json({ media: mediaAsset }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload mislukt" }, { status: 400 });
  }
}
