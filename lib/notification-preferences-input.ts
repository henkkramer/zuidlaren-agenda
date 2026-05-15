export type NotificationPreferencesInput = {
  activityReminders: boolean;
  businessUpdates: boolean;
  categorySlugs: string[];
  locationSlugs: string[];
  weeklyDigest: boolean;
};

export function parseNotificationSlugList(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter((item) => /^[a-z0-9_-]{1,60}$/.test(item)),
    ),
  ).slice(0, 20);
}

export function parseNotificationPreferencesInput(payload: Record<string, unknown>): NotificationPreferencesInput {
  return {
    activityReminders: payload.activityReminders === true,
    businessUpdates: payload.businessUpdates === true,
    categorySlugs: parseNotificationSlugList(payload.categorySlugs),
    locationSlugs: parseNotificationSlugList(payload.locationSlugs),
    weeklyDigest: payload.weeklyDigest === true,
  };
}
