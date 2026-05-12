import Link from "next/link";

export default function CheckEmailPage() {
  return (
    <main className="account-page">
      <section className="account-shell">
        <p className="account-kicker">Inloggen</p>
        <h1>Check je e-mail</h1>
        <p className="account-muted">
          De lokale ontwikkelomgeving logt de magic link in de server output als er nog geen e-mailprovider is ingesteld.
        </p>
        <Link className="outline-button" href="/account">
          Terug naar account
        </Link>
      </section>
    </main>
  );
}
