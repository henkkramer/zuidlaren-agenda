import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BusinessActivityEditor } from "@/components/business-activity-editor";
import { mapActivityRecord } from "@/lib/activity-mapper";
import { requireBusinessPermission } from "@/lib/business-permissions";
import { prisma } from "@/lib/prisma";

type EditActivityPageProps = {
  params: Promise<{
    activityId: string;
    businessId: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function EditBusinessActivityPage({ params }: EditActivityPageProps) {
  const { activityId, businessId } = await params;
  const access = await requireBusinessPermission(businessId);

  if (!access.ok) {
    if (access.status === 401) {
      redirect("/account");
    }

    if (access.status === 404) {
      notFound();
    }

    redirect("/business");
  }

  const activity = await prisma.activity.findFirst({
    where: {
      OR: [{ id: activityId }, { slug: decodeURIComponent(activityId) }],
      businessId: access.business.id,
    },
    include: {
      category: true,
      location: true,
    },
  });

  if (!activity) {
    notFound();
  }

  return (
    <main className="account-page" id="main-content">
      <section className="account-shell business-editor-shell">
        <Link className="account-back" href={`/business/${access.business.slug}`}>
          Terug naar dashboard
        </Link>
        <p className="account-kicker">Activiteit bewerken</p>
        <h1>{activity.title}</h1>
        <BusinessActivityEditor
          activityId={activity.slug}
          businessSlug={access.business.slug}
          initialActivity={mapActivityRecord(activity)}
          initialStatus={activity.status.toLowerCase()}
          organizerName={access.business.name}
        />
      </section>
    </main>
  );
}
