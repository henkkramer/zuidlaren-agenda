import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { requireBusinessPermission } from "@/lib/business-permissions";
import { rejectCrossOriginMutation } from "@/lib/csrf";
import { deleteLocalMedia } from "@/lib/media-storage";
import { prisma } from "@/lib/prisma";

type MediaContext = {
  params: Promise<{
    mediaId: string;
  }>;
};

export async function GET(_request: Request, context: MediaContext) {
  const { mediaId } = await context.params;
  const media = await prisma.mediaAsset.findFirst({
    where: { id: mediaId, deletedAt: null },
  });

  if (!media) {
    return NextResponse.json({ error: "Media niet gevonden" }, { status: 404 });
  }

  return NextResponse.json({ media });
}

export async function DELETE(request: Request, context: MediaContext) {
  const csrfResponse = rejectCrossOriginMutation(request);
  if (csrfResponse) return csrfResponse;

  const session = await getCurrentSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const { mediaId } = await context.params;
  const media = await prisma.mediaAsset.findFirst({
    where: { id: mediaId, deletedAt: null },
    include: { business: true },
  });

  if (!media) {
    return NextResponse.json({ ok: true });
  }

  const isOwner = media.ownerUserId === session.user.id;
  let canDelete = isOwner;

  if (!canDelete && media.business) {
    const access = await requireBusinessPermission(media.business.slug);
    canDelete = access.ok;
  }

  if (!canDelete) {
    return NextResponse.json({ error: "Geen toegang tot deze media" }, { status: 403 });
  }

  await prisma.mediaAsset.update({
    where: { id: media.id },
    data: { deletedAt: new Date() },
  });
  await deleteLocalMedia(media.storageKey);

  return NextResponse.json({ ok: true });
}
