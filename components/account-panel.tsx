"use client";

import Link from "next/link";
import { signIn, signOut } from "next-auth/react";
import type { FormEvent } from "react";
import { useState } from "react";

type AccountPanelProps =
  | {
      mode: "signed-out";
    }
  | {
      mode: "signed-in";
      user: {
        email: string;
        displayName: string;
        locale: string;
        deletionRequestedAt: string | null;
      };
      preferences: {
        activityReminders: boolean;
        weeklyDigest: boolean;
        businessUpdates: boolean;
      };
    };

export function AccountPanel(props: AccountPanelProps) {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState(props.mode === "signed-in" ? props.user.displayName : "");
  const [locale, setLocale] = useState(props.mode === "signed-in" ? props.user.locale : "nl-NL");
  const [preferences, setPreferences] = useState(
    props.mode === "signed-in"
      ? props.preferences
      : { activityReminders: false, weeklyDigest: false, businessUpdates: false },
  );
  const [deletionRequested, setDeletionRequested] = useState(
    props.mode === "signed-in" ? Boolean(props.user.deletionRequestedAt) : false,
  );
  const [status, setStatus] = useState("");

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Loginlink wordt gemaakt...");
    await signIn("email", { email, callbackUrl: "/account" });
  }

  async function saveProfile() {
    setStatus("Profiel opslaan...");
    const response = await fetch("/api/me/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName, locale, deletionRequested }),
    });

    setStatus(response.ok ? "Profiel opgeslagen" : "Profiel kon niet worden opgeslagen");
  }

  async function savePreferences(nextPreferences = preferences) {
    setStatus("Voorkeuren opslaan...");
    const response = await fetch("/api/me/notification-preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nextPreferences),
    });

    setStatus(response.ok ? "Voorkeuren opgeslagen" : "Voorkeuren konden niet worden opgeslagen");
  }

  function updatePreference(key: keyof typeof preferences) {
    const nextPreferences = { ...preferences, [key]: !preferences[key] };
    setPreferences(nextPreferences);
    void savePreferences(nextPreferences);
  }

  return (
    <main className="account-page">
      <section className="account-shell">
        <Link className="account-back" href="/">
          Terug naar agenda
        </Link>
        <p className="account-kicker">Mijn Zuidlaren Agenda</p>
        <h1>Account</h1>

        {props.mode === "signed-out" ? (
          <form className="account-form" onSubmit={handleSignIn}>
            <label>
              E-mailadres
              <input
                autoComplete="email"
                inputMode="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="naam@example.nl"
                required
                type="email"
                value={email}
              />
            </label>
            <button className="primary-button" type="submit">
              Loginlink ontvangen
            </button>
          </form>
        ) : (
          <div className="account-grid">
            <div className="account-card">
              <h2>Profiel</h2>
              <p className="account-muted">{props.user.email}</p>
              <label>
                Weergavenaam
                <input
                  maxLength={80}
                  minLength={2}
                  onChange={(event) => setDisplayName(event.target.value)}
                  value={displayName}
                />
              </label>
              <label>
                Taal
                <select onChange={(event) => setLocale(event.target.value)} value={locale}>
                  <option value="nl-NL">Nederlands</option>
                  <option value="en-US">English</option>
                </select>
              </label>
              <label className="account-check">
                <input
                  checked={deletionRequested}
                  onChange={(event) => setDeletionRequested(event.target.checked)}
                  type="checkbox"
                />
                Verwijdering van mijn account aanvragen
              </label>
              <button className="primary-button" onClick={saveProfile} type="button">
                Profiel opslaan
              </button>
            </div>

            <div className="account-card">
              <h2>Meldingen</h2>
              <label className="account-check">
                <input
                  checked={preferences.activityReminders}
                  onChange={() => updatePreference("activityReminders")}
                  type="checkbox"
                />
                Herinneringen voor gekozen activiteiten
              </label>
              <label className="account-check">
                <input checked={preferences.weeklyDigest} onChange={() => updatePreference("weeklyDigest")} type="checkbox" />
                Wekelijks overzicht
              </label>
              <label className="account-check">
                <input
                  checked={preferences.businessUpdates}
                  onChange={() => updatePreference("businessUpdates")}
                  type="checkbox"
                />
                Updates van organisatoren
              </label>
              <button className="outline-button" onClick={() => signOut({ callbackUrl: "/" })} type="button">
                Uitloggen
              </button>
            </div>
          </div>
        )}

        {status ? <p className="account-status">{status}</p> : null}
      </section>
    </main>
  );
}
