import Link from "next/link";

export default function CheckEmailPage() {
  return (
    <main className="account-page" id="main-content">
      <section className="account-shell">
        <p className="account-kicker">Inloggen</p>
        <h1>Check je e-mail</h1>
        <p className="account-muted">
          We hebben een loginlink naar je e-mailadres gestuurd. In lokale ontwikkeling wordt de link alleen in de serverlogs gezet als er geen
          `EMAIL_SERVER` is ingesteld. Zoek dan naar `auth.login_link.fallback`.
        </p>
        <Link className="outline-button" href="/account">
          Terug naar account
        </Link>
      </section>
    </main>
  );
}
