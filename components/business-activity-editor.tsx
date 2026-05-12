"use client";

import { useMemo, useState } from "react";
import { ActivityCard } from "@/components/activity-card";
import type { Activity, ActivityCategory } from "@/lib/activity-types";

const fallbackImage = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=85";

type BusinessActivityEditorProps = {
  businessSlug: string;
  organizerName: string;
};

export function BusinessActivityEditor({ businessSlug, organizerName }: BusinessActivityEditorProps) {
  const [title, setTitle] = useState("Nieuwe activiteit");
  const [shortDescription, setShortDescription] = useState("Korte beschrijving voor op de kaart.");
  const [description, setDescription] = useState("Volledige beschrijving van de activiteit.");
  const [locationName, setLocationName] = useState("Zuidlaren");
  const [address, setAddress] = useState("");
  const [category, setCategory] = useState<ActivityCategory>("cultuur");
  const [typeTags, setTypeTags] = useState("Binnen, Lokaal");
  const [imageUrl, setImageUrl] = useState(fallbackImage);
  const [startAt, setStartAt] = useState("2026-06-01T19:30");
  const [endAt, setEndAt] = useState("2026-06-01T21:30");
  const [sourceUrl, setSourceUrl] = useState("https://naarzuidlaren.nl/");
  const [status, setStatus] = useState("");

  const previewActivity = useMemo<Activity>(
    () => ({
      id: "preview",
      title,
      shortDescription,
      longDescription: description,
      imageUrl: imageUrl || fallbackImage,
      startDateTime: new Date(startAt).toISOString(),
      endDateTime: new Date(endAt).toISOString(),
      locationName,
      address: address || undefined,
      category,
      typeTags: typeTags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      organizerName,
      sourceUrl,
      indoorOutdoor: "Gemengd",
      sourceQuality: "Live preview",
    }),
    [address, category, description, endAt, imageUrl, locationName, organizerName, shortDescription, sourceUrl, startAt, title, typeTags],
  );

  async function createDraft(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Concept opslaan...");

    const response = await fetch(`/api/businesses/${businessSlug}/activities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        shortDescription,
        description,
        locationName,
        address,
        category,
        typeTags,
        imageUrl,
        startAt,
        endAt,
        sourceUrl,
        indoorOutdoor: "Gemengd",
      }),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus(body?.error ?? "Concept kon niet worden opgeslagen");
      return;
    }

    setStatus("Concept opgeslagen");
  }

  return (
    <div className="business-editor-grid">
      <form className="account-card business-editor-form" onSubmit={createDraft}>
        <h2>Gegevens</h2>
        <label>
          Titel
          <input onChange={(event) => setTitle(event.target.value)} value={title} />
        </label>
        <label>
          Korte beschrijving
          <textarea onChange={(event) => setShortDescription(event.target.value)} rows={3} value={shortDescription} />
        </label>
        <label>
          Beschrijving
          <textarea onChange={(event) => setDescription(event.target.value)} rows={6} value={description} />
        </label>
        <div className="business-editor-two">
          <label>
            Start
            <input onChange={(event) => setStartAt(event.target.value)} type="datetime-local" value={startAt} />
          </label>
          <label>
            Eind
            <input onChange={(event) => setEndAt(event.target.value)} type="datetime-local" value={endAt} />
          </label>
        </div>
        <div className="business-editor-two">
          <label>
            Categorie
            <select onChange={(event) => setCategory(event.target.value as ActivityCategory)} value={category}>
              <option value="cultuur">Cultuur</option>
              <option value="muziek">Muziek</option>
              <option value="sport">Sport</option>
              <option value="markt">Markt</option>
              <option value="kinderen">Kinderen</option>
              <option value="eten_drinken">Eten & drinken</option>
              <option value="natuur">Natuur</option>
            </select>
          </label>
          <label>
            Tags
            <input onChange={(event) => setTypeTags(event.target.value)} value={typeTags} />
          </label>
        </div>
        <label>
          Locatie
          <input onChange={(event) => setLocationName(event.target.value)} value={locationName} />
        </label>
        <label>
          Adres
          <input onChange={(event) => setAddress(event.target.value)} value={address} />
        </label>
        <label>
          Afbeelding URL
          <input onChange={(event) => setImageUrl(event.target.value)} value={imageUrl} />
        </label>
        <label>
          Website
          <input onChange={(event) => setSourceUrl(event.target.value)} value={sourceUrl} />
        </label>
        <button className="primary-button" type="submit">
          Concept opslaan
        </button>
        {status ? <p className="account-status">{status}</p> : null}
      </form>

      <div className="business-editor-preview">
        <p className="account-kicker">Live preview</p>
        <ActivityCard activity={previewActivity} onOpen={() => undefined} />
      </div>
    </div>
  );
}
