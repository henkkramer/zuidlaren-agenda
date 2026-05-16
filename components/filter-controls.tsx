"use client";

import { CalendarDays, Filter, MapPin, Search, Store, X } from "lucide-react";
import { useRouter } from "next/navigation";
import type { FormEvent, ReactNode } from "react";
import { useState } from "react";
import { categoryLabels } from "@/lib/activity-types";
import { toQueryString, type ActivityFilterOptions, type ActivityFilterState } from "@/lib/public-activity-query";

type FilterControlsProps = {
  filters: ActivityFilterState;
  options: ActivityFilterOptions;
};

type FilterOption = {
  label: string;
  value: string;
};

type ButtonFilterKey = "category" | "indoorOutdoor" | "location" | "organizer" | "type";

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
  const locationOptions = options.locations.map((location) => ({ label: location, value: location }));
  const organizerOptions = options.organizers.map((organizer) => ({ label: organizer, value: organizer }));
  const typeOptions = options.types.map((type) => ({ label: type, value: type }));
  const indoorOutdoorOptions = options.indoorOutdoor.map((value) => ({ label: value, value }));
  const optionLabelByFilter = {
    category: new Map(options.categories.map((option) => [option.value, option.label])),
    indoorOutdoor: new Map(indoorOutdoorOptions.map((option) => [option.value, option.label])),
    location: new Map(locationOptions.map((option) => [option.value, option.label])),
    organizer: new Map(organizerOptions.map((option) => [option.value, option.label])),
    type: new Map(typeOptions.map((option) => [option.value, option.label])),
  };

  function activeFilterLabel(key: string, value: string | boolean | number) {
    if (key in optionLabelByFilter && typeof value === "string") {
      return optionLabelByFilter[key as ButtonFilterKey].get(value) ?? labelForFilter(key, value);
    }

    return labelForFilter(key, value);
  }

  function renderButtonFilters(title: string, icon: ReactNode, filterKey: ButtonFilterKey, filterOptions: FilterOption[]) {
    if (!filterOptions.length) return null;

    return (
      <section className="filter-button-section">
        <div className="filter-button-title">
          {icon}
          <span>{title}</span>
        </div>
        <div className="filter-button-row">
          {filterOptions.map((option) => {
            const isActive = filters[filterKey] === option.value;
            return (
              <button
                className={`chip filter-button-chip ${isActive ? "active" : ""}`}
                key={option.value}
                onClick={() => go({ [filterKey]: isActive ? undefined : option.value } as Partial<Record<keyof ActivityFilterState, string | number | boolean | undefined>>)}
                type="button"
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <>
      <form className="search-row" onSubmit={submitSearch}>
        <Search size={17} />
        <input onChange={(event) => setQuery(event.target.value)} placeholder="Zoek activiteit, locatie of organisator" value={query} />
        <button type="submit">Zoeken</button>
      </form>
      <div className="chip-row">
        <button className={`chip ${filters.period === "today" ? "active" : ""}`} onClick={() => go({ end: undefined, period: filters.period === "today" ? undefined : "today", start: undefined })} type="button">
          Vandaag
        </button>
        <button className={`chip ${filters.period === "tomorrow" ? "active" : ""}`} onClick={() => go({ end: undefined, period: filters.period === "tomorrow" ? undefined : "tomorrow", start: undefined })} type="button">
          Morgen
        </button>
        <button className={`chip ${filters.period === "weekend" ? "active" : ""}`} onClick={() => go({ end: undefined, period: filters.period === "weekend" ? undefined : "weekend", start: undefined })} type="button">
          Dit weekend
        </button>
        <button className={`chip ${filters.period === "week" ? "active" : ""}`} onClick={() => go({ end: undefined, period: filters.period === "week" ? undefined : "week", start: undefined })} type="button">
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
      <div className="filter-button-groups">
        {renderButtonFilters("Categorie", <Filter size={14} />, "category", options.categories)}
        {renderButtonFilters("Locatie", <MapPin size={14} />, "location", locationOptions)}
        {renderButtonFilters("Type", <Store size={14} />, "type", typeOptions)}
        {renderButtonFilters("Binnen/buiten", <CalendarDays size={14} />, "indoorOutdoor", indoorOutdoorOptions)}
        {renderButtonFilters("Organisator", <Store size={14} />, "organizer", organizerOptions)}
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
              {activeFilterLabel(key, value as string | boolean | number)}
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
