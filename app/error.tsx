"use client";

import Link from "next/link";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="account-page" id="main-content">
      <section className="account-shell">
        <p className="account-kicker">Foutmelding</p>
        <h1>Er ging iets mis</h1>
        <div className="empty-state">
          <h2>De agenda kon niet worden geladen</h2>
          <p>Probeer opnieuw of ga terug naar de agenda.</p>
        </div>
        <div className="state-action-row">
          <button className="primary-button" onClick={reset} type="button">
            Opnieuw proberen
          </button>
          <Link className="outline-button" href="/">
            Naar agenda
          </Link>
        </div>
      </section>
    </main>
  );
}
