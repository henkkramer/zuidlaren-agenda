type ExportUser = {
  businessMemberships: Array<{
    active: boolean;
    business: { name: string; slug: string; status: string };
    role: string;
    canPublishActivities: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>;
  attendances: Array<{
    activity: {
      slug: string;
      title: string;
      startAt: Date;
      endAt: Date;
      organizerName: string;
      category: { name: string; slug: string };
      location: { name: string; slug: string };
    };
    status: string;
    visibility: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
  createdAt: Date;
  deletionRequestedAt: Date | null;
  displayName: string | null;
  email: string;
  id: string;
  locale: string;
  notificationPreferences: {
    activityReminders: boolean;
    weeklyDigest: boolean;
    businessUpdates: boolean;
    categorySlugs: string[];
    locationSlugs: string[];
  } | null;
  updatedAt: Date;
};

function iso(date: Date | null) {
  return date?.toISOString() ?? null;
}

export function buildPrivacyExport(user: ExportUser) {
  return {
    exportedAt: new Date().toISOString(),
    profile: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      locale: user.locale,
      deletionRequestedAt: iso(user.deletionRequestedAt),
      createdAt: iso(user.createdAt),
      updatedAt: iso(user.updatedAt),
    },
    notificationPreferences: user.notificationPreferences
      ? {
          activityReminders: user.notificationPreferences.activityReminders,
          weeklyDigest: user.notificationPreferences.weeklyDigest,
          businessUpdates: user.notificationPreferences.businessUpdates,
          categorySlugs: user.notificationPreferences.categorySlugs,
          locationSlugs: user.notificationPreferences.locationSlugs,
        }
      : null,
    attendances: user.attendances.map((attendance) => ({
      status: attendance.status.toLowerCase(),
      visibility: attendance.visibility.toLowerCase(),
      createdAt: iso(attendance.createdAt),
      updatedAt: iso(attendance.updatedAt),
      activity: {
        slug: attendance.activity.slug,
        title: attendance.activity.title,
        startAt: iso(attendance.activity.startAt),
        endAt: iso(attendance.activity.endAt),
        organizerName: attendance.activity.organizerName,
        category: attendance.activity.category,
        location: attendance.activity.location,
      },
    })),
    businessMemberships: user.businessMemberships.map((membership) => ({
      role: membership.role.toLowerCase(),
      active: membership.active,
      canPublishActivities: membership.canPublishActivities,
      createdAt: iso(membership.createdAt),
      updatedAt: iso(membership.updatedAt),
      business: {
        name: membership.business.name,
        slug: membership.business.slug,
        status: membership.business.status.toLowerCase(),
      },
    })),
  };
}
