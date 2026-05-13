import "server-only";

import type { Activity, ActivityCategory, Location, NotificationPreference, User } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type CampaignActivity = Activity & {
  category: ActivityCategory;
  location: Location;
};

type OptedInUser = User & {
  notificationPreferences: NotificationPreference | null;
};

export function userMatchesCampaign(user: OptedInUser, activity?: CampaignActivity | null) {
  const preferences = user.notificationPreferences;

  if (!preferences?.businessUpdates) {
    return false;
  }

  if (!activity) {
    return true;
  }

  const categoryMatch = preferences.categorySlugs.length === 0 || preferences.categorySlugs.includes(activity.category.slug);
  const locationMatch = preferences.locationSlugs.length === 0 || preferences.locationSlugs.includes(activity.location.slug);

  return categoryMatch && locationMatch;
}

export async function findCampaignRecipients(activity?: CampaignActivity | null) {
  const users = await prisma.user.findMany({
    where: {
      disabledAt: null,
      notificationPreferences: {
        businessUpdates: true,
      },
    },
    include: {
      notificationPreferences: true,
    },
  });

  return users.filter((user) => userMatchesCampaign(user, activity));
}

export async function hasRecentBusinessCampaign(businessId: string, requestedAfter: Date) {
  const count = await prisma.notificationCampaign.count({
    where: {
      businessId,
      requestedAt: {
        gte: requestedAfter,
      },
      status: {
        in: ["PENDING", "APPROVED", "SENT"],
      },
    },
  });

  return count > 0;
}
