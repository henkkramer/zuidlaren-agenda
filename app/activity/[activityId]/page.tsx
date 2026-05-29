import { after } from "next/server";
import { notFound } from "next/navigation";
import { ActivityDetailView } from "@/components/activity-detail-view";
import { BottomNavigation } from "@/components/bottom-navigation";
import { BrandHeader } from "@/components/zuidlaren-agenda-shell";
import { recordAnalyticsMetric } from "@/lib/analytics";
import { getCurrentSession } from "@/lib/auth";
import { getPublicActivityDetail } from "@/lib/public-activities";

export const revalidate = 60;

type ActivityPageProps = {
  params: Promise<{
    activityId: string;
  }>;
};

export default async function ActivityPage({ params }: ActivityPageProps) {
  const { activityId } = await params;
  const session = await getCurrentSession();
  const activity = await getPublicActivityDetail(activityId, session?.user?.id);

  if (!activity) {
    notFound();
  }

  after(() =>
    recordAnalyticsMetric({
      metric: "activity_view",
      activityId: activity.id,
      category: activity.category,
      location: activity.locationName,
    }),
  );

  return (
    <main className="app-page" id="main-content">
      <BrandHeader />
      <div className="app-container">
        <section className="agenda-surface">
          <ActivityDetailView activity={activity} backHref="/" />
        </section>
      </div>
      <BottomNavigation />
    </main>
  );
}
