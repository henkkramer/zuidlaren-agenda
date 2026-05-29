"use client";

import { signIn } from "next-auth/react";
import { useState, type FormEvent } from "react";

type CredentialsLoginFormProps = {
  callbackUrl: string;
  submitLabel: string;
};

export function CredentialsLoginForm({ callbackUrl, submitLabel }: CredentialsLoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Inloggen...");

    const result = await signIn("credentials", {
      username,
      password,
      callbackUrl,
      redirect: false,
    });

    if (result?.ok && result.url) {
      window.location.assign(result.url);
      return;
    }

    setStatus("Gebruikersnaam of wachtwoord klopt niet.");
  }

  return (
    <form className="account-form" onSubmit={handleSubmit}>
      <label>
        Gebruikersnaam
        <input
          autoComplete="username"
          onChange={(event) => setUsername(event.target.value)}
          required
          type="text"
          value={username}
        />
      </label>
      <label>
        Wachtwoord
        <input
          autoComplete="current-password"
          onChange={(event) => setPassword(event.target.value)}
          required
          type="password"
          value={password}
        />
      </label>
      <button className="primary-button" type="submit">
        {submitLabel}
      </button>
      {status ? (
        <p className="account-status" role="status" aria-live="polite">
          {status}
        </p>
      ) : null}
    </form>
  );
}
