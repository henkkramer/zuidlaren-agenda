import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BusinessActivityEditor } from "@/components/business-activity-editor";
import { requireBusinessPermission } from "@/lib/business-permissions";

type NewActivityPageProps = {
  params: Promise<{
    businessId: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function NewBusinessActivityPage({ params }: NewActivityPageProps) {
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

  return (
    <main className="account-page" id="main-content">
      <section className="account-shell business-editor-shell">
        <Link className="account-back" href={`/business/${access.business.slug}`}>
          Terug naar dashboard
        </Link>
        <p className="account-kicker">Nieuwe activiteit</p>
        <h1>Activiteit maken</h1>
        <BusinessActivityEditor businessSlug={access.business.slug} organizerName={access.business.name} />
      </section>
    </main>
  );
}
