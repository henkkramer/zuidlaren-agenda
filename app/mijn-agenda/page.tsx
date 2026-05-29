import Link from "next/link";
import { redirect } from "next/navigation";
import { PersonalAgendaShell } from "@/components/personal-agenda-shell";
import { getCurrentSession } from "@/lib/auth";
import { getPersonalAgendaItems } from "@/lib/personal-agenda";

export const dynamic = "force-dynamic";

export default async function MyAgendaPage() {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    redirect("/account");
  }

  const items = await getPersonalAgendaItems(session.user.id);

  return (
    <main className="account-page" id="main-content">
      <section className="account-shell personal-agenda-shell">
        <Link className="account-back" href="/">
          Terug naar agenda
        </Link>
        <p className="account-kicker">Mijn Zuidlaren Agenda</p>
        <h1>Mijn agenda</h1>
        <PersonalAgendaShell items={items} />
      </section>
    </main>
  );
}
