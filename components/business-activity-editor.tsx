"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { ActivityCard } from "@/components/activity-card";
import type { AiActivityAction, AiActivitySuggestion } from "@/lib/ai-card-assistant-types";
import type { Activity, ActivityCategory } from "@/lib/activity-types";

const fallbackImage = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=85";

const aiActions: Array<{ action: AiActivityAction; label: string }> = [
  { action: "improve_text", label: "Verbeter tekst" },
  { action: "shorten", label: "Maak korter" },
  { action: "more_enthusiastic", label: "Enthousiaster" },
  { action: "more_formal", label: "Formeler" },
  { action: "family_friendly", label: "Voor gezinnen" },
  { action: "suggest_tags", label: "Suggest tags" },
  { action: "suggest_category_type", label: "Categorie/type" },
  { action: "banner_prompt", label: "Banner prompt" },
  { action: "missing_information", label: "Check info" },
];

type BusinessActivityEditorProps = {
  activityId?: string;
  businessSlug: string;
  initialActivity?: Activity;
  initialStatus?: string;
  organizerName: string;
};

function toLocalInputValue(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "2026-06-01T19:30";
  }

  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60_000);
  return localDate.toISOString().slice(0, 16);
}

function safeDateTime(value: string, fallback: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : date.toISOString();
}

export function BusinessActivityEditor({ activityId, businessSlug, initialActivity, initialStatus = "draft", organizerName }: BusinessActivityEditorProps) {
  const [savedActivityId, setSavedActivityId] = useState(activityId);
  const [title, setTitle] = useState(initialActivity?.title ?? "Nieuwe activiteit");
  const [shortDescription, setShortDescription] = useState(initialActivity?.shortDescription ?? "Korte beschrijving voor op de kaart.");
  const [description, setDescription] = useState(initialActivity?.longDescription ?? "Volledige beschrijving van de activiteit.");
  const [locationName, setLocationName] = useState(initialActivity?.locationName ?? "Zuidlaren");
  const [address, setAddress] = useState(initialActivity?.address ?? "");
  const [category, setCategory] = useState<ActivityCategory>(initialActivity?.category ?? "cultuur");
  const [typeTags, setTypeTags] = useState(initialActivity?.typeTags.join(", ") ?? "Binnen, Lokaal");
  const [imageUrl, setImageUrl] = useState(initialActivity?.imageUrl ?? fallbackImage);
  const [startAt, setStartAt] = useState(toLocalInputValue(initialActivity?.startDateTime ?? "2026-06-01T19:30:00+02:00"));
  const [endAt, setEndAt] = useState(toLocalInputValue(initialActivity?.endDateTime ?? "2026-06-01T21:30:00+02:00"));
  const [sourceUrl, setSourceUrl] = useState(initialActivity?.sourceUrl ?? "https://naarzuidlaren.nl/");
  const [activityStatus, setActivityStatus] = useState(initialStatus);
  const [status, setStatus] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [aiStatus, setAiStatus] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState<AiActivitySuggestion | null>(null);
  const editableActivityId = savedActivityId ?? activityId;

  const previewActivity = useMemo<Activity>(
    () => ({
      id: "preview",
      title,
      shortDescription,
      longDescription: description,
      imageUrl: imageUrl || fallbackImage,
      startDateTime: safeDateTime(startAt, "2026-06-01T19:30:00+02:00"),
      endDateTime: safeDateTime(endAt, "2026-06-01T21:30:00+02:00"),
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

  function payload() {
    return {
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
    };
  }

  async function requestAiSuggestion(action: AiActivityAction) {
    setAiStatus("AI-suggestie ophalen...");
    setAiSuggestion(null);

    const response = await fetch(`/api/businesses/${businessSlug}/ai/activity-assist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        activity: {
          ...payload(),
          organizerName,
        },
      }),
    });

    const body = (await response.json().catch(() => null)) as { error?: string; suggestion?: AiActivitySuggestion } | null;

    if (!response.ok || !body?.suggestion) {
      setAiStatus(body?.error ?? "AI-suggestie kon niet worden opgehaald");
      return;
    }

    setAiSuggestion(body.suggestion);
    setAiStatus("Suggestie klaar. Pas alleen toe wat klopt.");
  }

  function applySuggestion(field: keyof NonNullable<AiActivitySuggestion["fields"]>) {
    const fields = aiSuggestion?.fields;

    if (!fields) {
      return;
    }

    if (field === "title" && fields.title) {
      setTitle(fields.title);
    }

    if (field === "shortDescription" && fields.shortDescription) {
      setShortDescription(fields.shortDescription);
    }

    if (field === "description" && fields.description) {
      setDescription(fields.description);
    }

    if (field === "typeTags" && fields.typeTags?.length) {
      setTypeTags(fields.typeTags.join(", "));
    }

    if (field === "category" && fields.category) {
      setCategory(fields.category);
    }
  }

  async function saveDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Concept opslaan...");
    const url = editableActivityId ? `/api/businesses/${businessSlug}/activities/${editableActivityId}` : `/api/businesses/${businessSlug}/activities`;

    const response = await fetch(url, {
      method: editableActivityId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload()),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus(body?.error ?? "Concept kon niet worden opgeslagen");
      return;
    }

    const body = (await response.json()) as { activity?: Activity; status?: string };
    if (body.activity?.id && !editableActivityId) {
      setSavedActivityId(body.activity.id);
      window.history.replaceState(null, "", `/business/${businessSlug}/activities/${body.activity.id}/edit`);
    }

    if (body.status) {
      setActivityStatus(body.status);
    }

    setStatus(editableActivityId ? "Wijzigingen opgeslagen" : "Concept opgeslagen");
  }

  async function changePublication(nextAction: "publish" | "unpublish") {
    if (!editableActivityId) {
      setStatus("Sla eerst het concept op voordat je publiceert.");
      return;
    }

    setStatus(nextAction === "publish" ? "Publiceren..." : "Offline halen...");
    const response = await fetch(`/api/businesses/${businessSlug}/activities/${editableActivityId}/${nextAction}`, {
      method: "POST",
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus(body?.error ?? "Status kon niet worden aangepast");
      return;
    }

    const body = (await response.json()) as { status: string };
    setActivityStatus(body.status);
    setStatus(nextAction === "publish" ? "Activiteit gepubliceerd" : "Activiteit offline gehaald");
  }

  async function uploadBanner(file: File | null) {
    if (!file) {
      return;
    }

    setUploadStatus("Afbeelding uploaden...");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("businessId", businessSlug);

    const response = await fetch("/api/media", {
      method: "POST",
      body: formData,
    });

    const body = (await response.json().catch(() => null)) as { error?: string; media?: { publicUrl: string } } | null;

    if (!response.ok || !body?.media?.publicUrl) {
      setUploadStatus(body?.error ?? "Upload mislukt");
      return;
    }

    setImageUrl(body.media.publicUrl);
    setUploadStatus("Afbeelding toegevoegd");
  }

  return (
    <div className="business-editor-grid">
      <form className="account-card business-editor-form" onSubmit={saveDraft}>
        <div className="panel-header">
          <h2>Gegevens</h2>
          <span className="status-pill">{activityStatus}</span>
        </div>
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
        <section className="ai-assist-panel" aria-label="AI kaarthulp">
          <div className="panel-header">
            <div>
              <p className="account-kicker">AI kaarthulp</p>
              <h3>Suggesties</h3>
            </div>
          </div>
          <div className="ai-action-grid">
            {aiActions.map((item) => (
              <button className="outline-button ai-action-button" key={item.action} onClick={() => requestAiSuggestion(item.action)} type="button">
                {item.label}
              </button>
            ))}
          </div>
          {aiStatus ? <p className="small-muted">{aiStatus}</p> : null}
          {aiSuggestion ? (
            <div className="ai-suggestion-box">
              {aiSuggestion.notes.length ? (
                <ul className="ai-note-list">
                  {aiSuggestion.notes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              ) : null}
              {aiSuggestion.fields?.title ? (
                <div className="ai-field-suggestion">
                  <strong>Titel</strong>
                  <p>{aiSuggestion.fields.title}</p>
                  <button className="outline-button ai-apply-button" onClick={() => applySuggestion("title")} type="button">
                    Titel toepassen
                  </button>
                </div>
              ) : null}
              {aiSuggestion.fields?.shortDescription ? (
                <div className="ai-field-suggestion">
                  <strong>Korte beschrijving</strong>
                  <p>{aiSuggestion.fields.shortDescription}</p>
                  <button className="outline-button ai-apply-button" onClick={() => applySuggestion("shortDescription")} type="button">
                    Korte tekst toepassen
                  </button>
                </div>
              ) : null}
              {aiSuggestion.fields?.description ? (
                <div className="ai-field-suggestion">
                  <strong>Beschrijving</strong>
                  <p>{aiSuggestion.fields.description}</p>
                  <button className="outline-button ai-apply-button" onClick={() => applySuggestion("description")} type="button">
                    Beschrijving toepassen
                  </button>
                </div>
              ) : null}
              {aiSuggestion.fields?.category ? (
                <div className="ai-field-suggestion">
                  <strong>Categorie</strong>
                  <p>{aiSuggestion.fields.category}</p>
                  <button className="outline-button ai-apply-button" onClick={() => applySuggestion("category")} type="button">
                    Categorie toepassen
                  </button>
                </div>
              ) : null}
              {aiSuggestion.fields?.typeTags?.length ? (
                <div className="ai-field-suggestion">
                  <strong>Tags</strong>
                  <p>{aiSuggestion.fields.typeTags.join(", ")}</p>
                  <button className="outline-button ai-apply-button" onClick={() => applySuggestion("typeTags")} type="button">
                    Tags toepassen
                  </button>
                </div>
              ) : null}
              {aiSuggestion.bannerPrompt ? (
                <div className="ai-field-suggestion">
                  <strong>Banner prompt</strong>
                  <p>{aiSuggestion.bannerPrompt}</p>
                </div>
              ) : null}
            </div>
          ) : null}
        </section>
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
          Banner uploaden
          <input accept="image/jpeg,image/png,image/webp" onChange={(event) => uploadBanner(event.target.files?.[0] ?? null)} type="file" />
        </label>
        {uploadStatus ? <p className="small-muted">{uploadStatus}</p> : null}
        <label>
          Website
          <input onChange={(event) => setSourceUrl(event.target.value)} value={sourceUrl} />
        </label>
        <button className="primary-button" type="submit">
          {editableActivityId ? "Wijzigingen opslaan" : "Concept opslaan"}
        </button>
        <div className="business-editor-actions">
          <button className="outline-button" onClick={() => changePublication("publish")} type="button">
            Publiceren
          </button>
          <button className="outline-button" onClick={() => changePublication("unpublish")} type="button">
            Offline halen
          </button>
        </div>
        {status ? <p className="account-status">{status}</p> : null}
      </form>

      <div className="business-editor-preview">
        <p className="account-kicker">Live preview</p>
        <ActivityCard activity={previewActivity} onOpen={() => undefined} />
      </div>
    </div>
  );
}
