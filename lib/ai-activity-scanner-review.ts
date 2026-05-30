import "server-only";

import { createAdminAuditLog } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { revalidatePublicActivityCaches } from "@/lib/public-activity-cache";
import { slugify } from "@/lib/slugify";

const fallbackImage = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=85";

type ReviewResult = {
  activityId?: string;
  candidateId: string;
  status: string;
};

export async function approveScanCandidate(candidateId: string, actorId: string): Promise<ReviewResult> {
  const candidate = await prisma.activityScanCandidate.findUnique({
    where: { id: candidateId },
  });

  if (!candidate) {
    throw new Error("Scanvoorstel niet gevonden");
  }

  if (candidate.approvedActivityId) {
    return { activityId: candidate.approvedActivityId, candidateId: candidate.id, status: candidate.status };
  }

  const category = await prisma.activityCategory.upsert({
    where: { slug: candidate.categorySlug },
    update: {},
    create: { slug: candidate.categorySlug, name: candidate.categorySlug.replaceAll("_", " ") },
  });

  const location = await prisma.location.upsert({
    where: { slug: slugify(candidate.locationName) },
    update: { address: candidate.address },
    create: {
      address: candidate.address,
      name: candidate.locationName,
      slug: slugify(candidate.locationName),
    },
  });

  const business = await prisma.business.upsert({
    where: { slug: slugify(candidate.organizerName) },
    update: { name: candidate.organizerName, status: "APPROVED", website: candidate.sourceUrl },
    create: {
      name: candidate.organizerName,
      slug: slugify(candidate.organizerName),
      status: "APPROVED",
      website: candidate.sourceUrl,
    },
  });

  const slugBase = `${slugify(candidate.title)}-${candidate.startAt.toISOString().slice(0, 10)}`;
  const activity = await prisma.activity.upsert({
    where: { slug: slugBase },
    update: {
      businessId: business.id,
      categoryId: category.id,
      description: candidate.description,
      endAt: candidate.endAt,
      expectedVisitors: candidate.expectedVisitors,
      imageUrl: candidate.imageUrl ?? fallbackImage,
      indoorOutdoor: candidate.indoorOutdoor,
      locationId: location.id,
      organizerName: candidate.organizerName,
      shortDescription: candidate.shortDescription,
      sourceQuality: `AI scanvoorstel, admin goedgekeurd, vertrouwen ${candidate.confidence}%`,
      sourceUrl: candidate.sourceUrl,
      startAt: candidate.startAt,
      status: "PUBLISHED",
      title: candidate.title,
      typeTags: candidate.typeTags,
    },
    create: {
      businessId: business.id,
      categoryId: category.id,
      description: candidate.description,
      endAt: candidate.endAt,
      expectedVisitors: candidate.expectedVisitors,
      imageUrl: candidate.imageUrl ?? fallbackImage,
      indoorOutdoor: candidate.indoorOutdoor,
      locationId: location.id,
      organizerName: candidate.organizerName,
      shortDescription: candidate.shortDescription,
      slug: slugBase,
      sourceQuality: `AI scanvoorstel, admin goedgekeurd, vertrouwen ${candidate.confidence}%`,
      sourceUrl: candidate.sourceUrl,
      startAt: candidate.startAt,
      status: "PUBLISHED",
      title: candidate.title,
      typeTags: candidate.typeTags,
    },
  });

  await prisma.activityScanCandidate.update({
    where: { id: candidate.id },
    data: {
      approvedActivityId: activity.id,
      rejectionReason: null,
      reviewedAt: new Date(),
      reviewedById: actorId,
      status: "APPROVED",
    },
  });

  await createAdminAuditLog({
    actorId,
    action: "admin.activity_scan_candidate.approve",
    targetType: "ActivityScanCandidate",
    targetId: candidate.id,
    metadata: { activityId: activity.id, sourceUrl: candidate.sourceUrl, title: candidate.title },
  });

  revalidatePublicActivityCaches({ filterOptions: true });

  return { activityId: activity.id, candidateId: candidate.id, status: "APPROVED" };
}

export async function rejectScanCandidate(candidateId: string, actorId: string, reason: string): Promise<ReviewResult> {
  const candidate = await prisma.activityScanCandidate.update({
    where: { id: candidateId },
    data: {
      rejectionReason: reason.trim() || "Afgewezen door admin",
      reviewedAt: new Date(),
      reviewedById: actorId,
      status: "REJECTED",
    },
  });

  await createAdminAuditLog({
    actorId,
    action: "admin.activity_scan_candidate.reject",
    targetType: "ActivityScanCandidate",
    targetId: candidate.id,
    metadata: { reason: candidate.rejectionReason ?? "", sourceUrl: candidate.sourceUrl, title: candidate.title },
  });

  return { candidateId: candidate.id, status: "REJECTED" };
}
