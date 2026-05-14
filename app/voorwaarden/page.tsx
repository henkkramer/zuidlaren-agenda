import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="account-page legal-page" id="main-content">
      <section className="account-shell">
        <nav className="account-utility-nav" aria-label="Juridische navigatie">
          <Link className="account-back" href="/">
            Terug naar agenda
          </Link>
          <Link href="/privacy">Privacy</Link>
        </nav>
        <p className="account-kicker">Voorwaarden</p>
        <h1>Publicatievoorwaarden</h1>

        <div className="legal-content">
          <section>
            <h2>Voor lokale activiteiten</h2>
            <p>
              Zuidlaren Agenda is bedoeld voor activiteiten in en rond Zuidlaren. Kaarten moeten een duidelijke datum, locatie,
              organisator en bron bevatten.
            </p>
          </section>
          <section>
            <h2>Moderatie</h2>
            <p>
              Beheerders mogen activiteiten aanpassen, weigeren of verwijderen wanneer informatie onjuist, misleidend, dubbel of
              niet lokaal relevant is.
            </p>
          </section>
          <section>
            <h2>Zakelijke functies</h2>
            <p>
              Organisaties blijven verantwoordelijk voor hun eigen teksten, afbeeldingen en meldingen. Betaalde functies zijn
              voorbereid, maar niet verplicht voor de MVP.
            </p>
          </section>
          <section>
            <h2>Beschikbaarheid</h2>
            <p>
              De MVP wordt eerst gebruikt door een gecontroleerde testgroep. Er is geen garantie dat elke activiteit altijd zonder
              onderbreking zichtbaar is.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
