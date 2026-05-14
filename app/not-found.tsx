import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="account-page" id="main-content">
      <section className="account-shell">
        <p className="account-kicker">Niet gevonden</p>
        <h1>Deze pagina bestaat niet</h1>
        <div className="empty-state">
          <h2>Controleer de link</h2>
          <p>De activiteit, pagina of beheerlink is niet meer beschikbaar of nooit gepubliceerd.</p>
        </div>
        <Link className="primary-button state-single-action" href="/">
          Terug naar agenda
        </Link>
      </section>
    </main>
  );
}
