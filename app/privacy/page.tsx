import Link from "next/link";
import { privacyProcessors } from "@/lib/privacy-processors";

export default function PrivacyPage() {
  return (
    <main className="account-page legal-page" id="main-content">
      <section className="account-shell">
        <nav className="account-utility-nav" aria-label="Juridische navigatie">
          <Link className="account-back" href="/">
            Terug naar agenda
          </Link>
          <Link href="/voorwaarden">Voorwaarden</Link>
        </nav>
        <p className="account-kicker">Privacy</p>
        <h1>Privacyverklaring</h1>

        <div className="legal-content">
          <section>
            <h2>Welke gegevens we bewaren</h2>
            <p>
              We bewaren alleen gegevens die nodig zijn voor de agenda: je e-mailadres, profielnaam, taal, notificatievoorkeuren,
              gekozen activiteiten en zakelijke rollen wanneer je een organisatie beheert.
            </p>
          </section>
          <section>
            <h2>Aanwezigheid en meldingen</h2>
            <p>
              Aanwezigheid is standaard prive. Alleen wanneer je zelf openbaar kiest, mag dit zichtbaar worden buiten je eigen
              account. Notificaties staan standaard uit en worden pas gebruikt na expliciete opt-in.
            </p>
          </section>
          <section>
            <h2>Analytics</h2>
            <p>
              De MVP gebruikt geaggregeerde statistieken voor kaartviews, filters en klikken. We bouwen geen persoonlijke
              browseprofielen en gebruiken geen advertentiecookies.
            </p>
          </section>
          <section>
            <h2>Verwerkers</h2>
            <ul>
              {privacyProcessors.map((processor) => (
                <li key={processor.name}>
                  {processor.name}: {processor.purpose}
                  {processor.mvpStatus === "prepared" ? " Nog niet live in de MVP." : null}
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2>Gegevens downloaden of verwijderen</h2>
            <p>
              In je account kun je je gegevens downloaden en verwijdering aanvragen. Een beheerder handelt verwijderverzoeken af
              voordat de MVP breder wordt uitgerold.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
