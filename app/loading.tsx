export default function LoadingPage() {
  return (
    <main className="account-page" id="main-content" aria-busy="true">
      <section className="account-shell">
        <p className="account-kicker">Laden</p>
        <h1>Agenda wordt geladen</h1>
        <div className="loading-stack" aria-label="Inhoud wordt geladen">
          <span />
          <span />
          <span />
        </div>
      </section>
    </main>
  );
}
