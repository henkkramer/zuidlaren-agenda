"use client";

import { CalendarDays, Filter, MapPin, Search, Store, X } from "lucide-react";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";
import { categoryLabels } from "@/lib/activity-types";
import { toQueryString, type ActivityFilterOptions, type ActivityFilterState } from "@/lib/public-activity-query";

type FilterControlsProps = {
  filters: ActivityFilterState;
  options: ActivityFilterOptions;
};

function labelForFilter(key: string, value: string | boolean | number) {
  if (key === "period") {
    return { today: "Vandaag", tomorrow: "Morgen", weekend: "Dit weekend", week: "Deze week" }[String(value)] ?? String(value);
  }

  if (key === "category") return categoryLabels[String(value) as keyof typeof categoryLabels] ?? String(value);
  if (key === "family") return "Familie";
  if (key === "price") return value === "free" ? "Gratis" : "Betaald";
  if (key === "q") return `Zoeken: ${value}`;
  if (key === "start") return `Vanaf ${value}`;
  if (key === "end") return `Tot ${value}`;

  return String(value);
}

export function FilterControls({ filters, options }: FilterControlsProps) {
  const router = useRouter();
  const [query, setQuery] = useState(filters.q ?? "");

  function go(overrides: Partial<Record<keyof ActivityFilterState, string | number | boolean | undefined>>) {
    const queryString = toQueryString({ ...filters, cursor: undefined, limit: 24 }, overrides);
    router.push(queryString ? `/?${queryString}` : "/");
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    go({ q: query.trim() || undefined });
  }

  const activeFilters = Object.entries(filters).filter(([key, value]) => key !== "limit" && value !== undefined && value !== false && value !== "");

  return (
    <>
      <form className="search-row" onSubmit={submitSearch}>
        <Search size={17} />
        <input onChange={(event) => setQuery(event.target.value)} placeholder="Zoek activiteit, locatie of organisator" value={query} />
        <button type="submit">Zoeken</button>
      </form>
      <div className="chip-row">
        <button className={`chip ${filters.period === "today" ? "active" : ""}`} onClick={() => go({ period: filters.period === "today" ? undefined : "today" })} type="button">
          Vandaag
        </button>
        <button className={`chip ${filters.period === "tomorrow" ? "active" : ""}`} onClick={() => go({ period: filters.period === "tomorrow" ? undefined : "tomorrow" })} type="button">
          Morgen
        </button>
        <button className={`chip ${filters.period === "weekend" ? "active" : ""}`} onClick={() => go({ period: filters.period === "weekend" ? undefined : "weekend" })} type="button">
          Dit weekend
        </button>
        <button className={`chip ${filters.period === "week" ? "active" : ""}`} onClick={() => go({ period: filters.period === "week" ? undefined : "week" })} type="button">
          Deze week
        </button>
        <button className={`chip ${filters.family ? "active" : ""}`} onClick={() => go({ family: filters.family ? undefined : true })} type="button">
          Familie
        </button>
        <button className={`chip ${filters.price === "free" ? "active" : ""}`} onClick={() => go({ price: filters.price === "free" ? undefined : "free" })} type="button">
          Gratis
        </button>
        <button className={`chip ${filters.price === "paid" ? "active" : ""}`} onClick={() => go({ price: filters.price === "paid" ? undefined : "paid" })} type="button">
          Betaald
        </button>
      </div>
      <div className="secondary-filters">
        <label className="filter-select">
          <Filter size={14} />
          <select onChange={(event) => go({ category: event.target.value || undefined })} value={filters.category ?? ""}>
            <option value="">Categorie</option>
            {options.categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </label>
        <label className="filter-select">
          <MapPin size={14} />
          <select onChange={(event) => go({ location: event.target.value || undefined })} value={filters.location ?? ""}>
            <option value="">Locatie</option>
            {options.locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </label>
        <label className="filter-select">
          <Store size={14} />
          <select onChange={(event) => go({ type: event.target.value || undefined })} value={filters.type ?? ""}>
            <option value="">Type</option>
            {options.types.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <label className="filter-select">
          <CalendarDays size={14} />
          <select onChange={(event) => go({ indoorOutdoor: event.target.value || undefined })} value={filters.indoorOutdoor ?? ""}>
            <option value="">Binnen/buiten</option>
            {options.indoorOutdoor.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label className="filter-select">
          <Store size={14} />
          <select onChange={(event) => go({ organizer: event.target.value || undefined })} value={filters.organizer ?? ""}>
            <option value="">Organisator</option>
            {options.organizers.map((organizer) => (
              <option key={organizer} value={organizer}>
                {organizer}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="date-filter-row">
        <label>
          Vanaf
          <input onChange={(event) => go({ period: undefined, start: event.target.value || undefined })} type="date" value={filters.start ?? ""} />
        </label>
        <label>
          Tot
          <input onChange={(event) => go({ period: undefined, end: event.target.value || undefined })} type="date" value={filters.end ?? ""} />
        </label>
      </div>
      {activeFilters.length ? (
        <div className="active-filter-row">
          {activeFilters.map(([key, value]) => (
            <button key={key} onClick={() => go({ [key]: undefined } as Partial<Record<keyof ActivityFilterState, undefined>>)} type="button">
              {labelForFilter(key, value as string | boolean | number)}
              <X size={13} />
            </button>
          ))}
          <button onClick={() => router.push("/")} type="button">
            Wis alles
            <X size={13} />
          </button>
        </div>
      ) : null}
    </>
  );
}
