import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireBusinessPermission } from "@/lib/business-permissions";
import { mapActivityRecord } from "@/lib/activity-mapper";
import { prisma } from "@/lib/prisma";
import { activityDateParts } from "@/lib/date-format";
import { BusinessNotificationCampaignForm } from "@/components/business-notification-campaign-form";

type BusinessDashboardPageProps = {
  params: Promise<{
    businessId: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function BusinessDashboardPage({ params }: BusinessDashboardPageProps) {
  const { businessId } = await params;
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

  const [activities, members, campaigns] = await Promise.all([
    prisma.activity.findMany({
      where: { businessId: access.business.id },
      include: {
        category: true,
        location: true,
      },
      orderBy: { startAt: "asc" },
    }),
    prisma.businessMember.findMany({
      where: { businessId: access.business.id, active: true },
      include: { user: true },
      orderBy: [{ role: "desc" }, { createdAt: "asc" }],
    }),
    prisma.notificationCampaign.findMany({
      where: { businessId: access.business.id },
      include: {
        _count: { select: { deliveries: true } },
      },
      orderBy: { requestedAt: "desc" },
      take: 5,
    }),
  ]);

  const canPublish = access.membership.role === "OWNER" || access.membership.canPublishActivities;

  return (
    <main className="account-page">
      <section className="account-shell business-dashboard-shell">
        <Link className="account-back" href="/business">
          Terug naar bedrijven
        </Link>
        <p className="account-kicker">Business dashboard</p>
        <div className="business-dashboard-header">
          <div>
            <h1>{access.business.name}</h1>
            <p className="account-muted">
              {access.membership.role === "OWNER" ? "Eigenaar" : "Medewerker"} ·{" "}
              {access.business.status === "APPROVED" ? "goedgekeurd" : "nog niet goedgekeurd"}
            </p>
          </div>
          <span className="status-pill">{canPublish ? "Kan publiceren" : "Concepten beheren"}</span>
        </div>

        <div className="business-dashboard-grid">
          <section className="account-card">
            <div className="panel-header">
              <h2>Activiteiten</h2>
              <Link className="status-pill" href={`/business/${access.business.slug}/activities/new`}>
                Nieuw
              </Link>
            </div>
            {activities.length === 0 ? (
              <p className="account-muted">Nog geen activiteiten voor dit bedrijf.</p>
            ) : (
              <div className="business-activity-list">
                {activities.slice(0, 12).map((activity) => {
                  const mappedActivity = mapActivityRecord(activity);
                  const parts = activityDateParts(mappedActivity);
                  return (
                    <div className="business-activity-row" key={activity.id}>
                      <span>
                        <strong>{activity.title}</strong>
                        <small>
                          {parts.longDate} · {parts.time}
                        </small>
                      </span>
                      <span className="business-row-actions">
                        <span className="status-pill">{activity.status.toLowerCase()}</span>
                        <Link className="status-pill" href={`/business/${access.business.slug}/activities/${mappedActivity.id}/edit`}>
                          Bewerken
                        </Link>
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="account-card">
            <h2>Team</h2>
            <div className="business-member-list">
              {members.map((member) => (
                <div className="business-member-row" key={member.id}>
                  <span>
                    <strong>{member.user.displayName ?? member.user.name ?? member.user.email}</strong>
                    <small>{member.user.email}</small>
                  </span>
                  <span className="status-pill">{member.role === "OWNER" ? "Eigenaar" : "Medewerker"}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="account-card">
            <h2>Notificaties</h2>
            <p className="account-muted">
              Notificaties zijn opt-in en worden pas na admincontrole gebruikt.
            </p>
            {canPublish && activities.length > 0 ? (
              <BusinessNotificationCampaignForm
                activities={activities.map((activity) => ({ id: activity.id, title: activity.title }))}
                businessSlug={access.business.slug}
              />
            ) : (
              <p className="account-muted">Maak eerst een activiteit aan en publicatierechten zijn vereist.</p>
            )}
            <div className="business-member-list">
              {campaigns.map((campaign) => (
                <div className="business-member-row" key={campaign.id}>
                  <span>
                    <strong>{campaign.title}</strong>
                    <small>{campaign._count.deliveries} beoogde ontvangers</small>
                  </span>
                  <span className="status-pill">{campaign.status.toLowerCase()}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
