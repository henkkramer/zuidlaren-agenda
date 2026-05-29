"use client";

import Link from "next/link";
import { signIn, signOut } from "next-auth/react";
import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";

type AccountPanelProps =
  | {
      mode: "signed-out";
    }
  | {
      mode: "signed-in";
      user: {
        email: string;
        displayName: string;
        isAdmin: boolean;
        locale: string;
        deletionRequestedAt: string | null;
      };
      preferences: {
        activityReminders: boolean;
        weeklyDigest: boolean;
        businessUpdates: boolean;
        categorySlugs: string[];
        locationSlugs: string[];
      };
      preferenceOptions: {
        categories: Array<{ slug: string; name: string }>;
        locations: Array<{ slug: string; name: string }>;
      };
    };

export function AccountPanel(props: AccountPanelProps) {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState(props.mode === "signed-in" ? props.user.displayName : "");
  const [locale, setLocale] = useState(props.mode === "signed-in" ? props.user.locale : "nl-NL");
  const [preferences, setPreferences] = useState(
    props.mode === "signed-in"
      ? props.preferences
      : { activityReminders: false, weeklyDigest: false, businessUpdates: false, categorySlugs: [], locationSlugs: [] },
  );
  const [deletionRequested, setDeletionRequested] = useState(
    props.mode === "signed-in" ? Boolean(props.user.deletionRequestedAt) : false,
  );
  const [status, setStatus] = useState("");
  const preferenceSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (preferenceSaveTimer.current) {
        clearTimeout(preferenceSaveTimer.current);
      }
    };
  }, []);

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

  function queuePreferenceSave(nextPreferences: typeof preferences) {
    if (preferenceSaveTimer.current) {
      clearTimeout(preferenceSaveTimer.current);
    }

    setStatus("Voorkeuren worden opgeslagen...");
    preferenceSaveTimer.current = setTimeout(() => {
      void savePreferences(nextPreferences);
    }, 300);
  }

  function updatePreference(key: keyof typeof preferences) {
    const nextPreferences = { ...preferences, [key]: !preferences[key] };
    setPreferences(nextPreferences);
    queuePreferenceSave(nextPreferences);
  }

  function togglePreferenceList(key: "categorySlugs" | "locationSlugs", slug: string) {
    const current = preferences[key];
    const nextList = current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug];
    const nextPreferences = { ...preferences, [key]: nextList };
    setPreferences(nextPreferences);
    queuePreferenceSave(nextPreferences);
  }

  return (
    <main className="account-page" id="main-content">
      <section className="account-shell">
        <nav className="account-utility-nav" aria-label="Account navigatie">
          <Link className="account-back" href="/">
            Terug naar agenda
          </Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/voorwaarden">Voorwaarden</Link>
        </nav>
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
              {props.user.isAdmin ? (
                <Link className="outline-button" href="/admin">
                  Open admin
                </Link>
              ) : null}
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
              <a className="outline-button" href="/api/me/export">
                Mijn gegevens downloaden
              </a>
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
              <div className="preference-group">
                <strong>Categorieën</strong>
                <div className="preference-chip-grid">
                  {props.preferenceOptions.categories.map((category) => (
                    <label className="preference-chip" key={category.slug}>
                      <input
                        checked={preferences.categorySlugs.includes(category.slug)}
                        onChange={() => togglePreferenceList("categorySlugs", category.slug)}
                        type="checkbox"
                      />
                      {category.name}
                    </label>
                  ))}
                </div>
              </div>
              <div className="preference-group">
                <strong>Locaties</strong>
                <div className="preference-chip-grid">
                  {props.preferenceOptions.locations.map((location) => (
                    <label className="preference-chip" key={location.slug}>
                      <input
                        checked={preferences.locationSlugs.includes(location.slug)}
                        onChange={() => togglePreferenceList("locationSlugs", location.slug)}
                        type="checkbox"
                      />
                      {location.name}
                    </label>
                  ))}
                </div>
              </div>
              <button className="outline-button" onClick={() => signOut({ callbackUrl: "/" })} type="button">
                Uitloggen
              </button>
            </div>
          </div>
        )}

        {status ? (
          <p className="account-status" role="status" aria-live="polite">
            {status}
          </p>
        ) : null}
      </section>
    </main>
  );
}
