import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentBusinessMemberships } from "@/lib/business-permissions";

type BusinessMembershipRow = {
  business: {
    name: string;
    slug: string;
    status: string;
  };
  id: string;
  role: string;
};

export const dynamic = "force-dynamic";

export default async function BusinessIndexPage() {
  const memberships = await getCurrentBusinessMemberships();

  if (!memberships) {
    redirect("/account");
  }

  return (
    <main className="account-page" id="main-content">
      <section className="account-shell">
        <Link className="account-back" href="/">
          Terug naar agenda
        </Link>
        <p className="account-kicker">Bedrijven</p>
        <h1>Business dashboard</h1>

        {memberships.length === 0 ? (
          <div className="empty-state">
            <h2>Nog geen bedrijf gekoppeld</h2>
            <p>Een beheerder moet je eerst als eigenaar of medewerker aan een goedgekeurd bedrijf koppelen.</p>
          </div>
        ) : (
          <div className="business-list">
            {(memberships as BusinessMembershipRow[]).map((membership) => (
              <Link className="business-list-item" href={`/business/${membership.business.slug}`} key={membership.id}>
                <span>
                  <strong>{membership.business.name}</strong>
                  <small>
                    {membership.role === "OWNER" ? "Eigenaar" : "Medewerker"} · {membership.business.status.toLowerCase()}
                  </small>
                </span>
                <span className="status-pill">{membership.business.status === "APPROVED" ? "Goedgekeurd" : "In afwachting"}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
