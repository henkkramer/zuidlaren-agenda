import { AccountPanel } from "@/components/account-panel";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type PreferenceCategory = {
  name: string;
  slug: string;
};

type PreferenceLocation = {
  name: string;
  slug: string;
};

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    return <AccountPanel mode="signed-out" />;
  }

  const [user, categories, locations] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      include: { notificationPreferences: true },
    }),
    prisma.activityCategory.findMany({ orderBy: { name: "asc" } }),
    prisma.location.findMany({ orderBy: { name: "asc" }, take: 16 }),
  ]);

  if (!user) {
    return <AccountPanel mode="signed-out" />;
  }

  const preferences =
    user.notificationPreferences ??
    (await prisma.notificationPreference.create({
      data: { userId: user.id },
    }));

  return (
    <AccountPanel
      mode="signed-in"
      user={{
        email: user.email,
        displayName: user.displayName ?? user.name ?? "",
        locale: user.locale,
        deletionRequestedAt: user.deletionRequestedAt?.toISOString() ?? null,
      }}
      preferences={{
        activityReminders: preferences.activityReminders,
        weeklyDigest: preferences.weeklyDigest,
        businessUpdates: preferences.businessUpdates,
        categorySlugs: preferences.categorySlugs,
        locationSlugs: preferences.locationSlugs,
      }}
      preferenceOptions={{
        categories: (categories as PreferenceCategory[]).map((category) => ({ slug: category.slug, name: category.name })),
        locations: (locations as PreferenceLocation[]).map((location) => ({ slug: location.slug, name: location.name })),
      }}
    />
  );
}
