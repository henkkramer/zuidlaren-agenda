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
    const queryString = toQueryString({ ...filters, cursor: undefined, limit: 50 }, overrides);
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

  function renderFilterSelect(title: string, icon: ReactNode, filterKey: ButtonFilterKey, filterOptions: FilterOption[]) {
    if (!filterOptions.length) return null;

    return (
      <label className={`filter-select-menu ${filters[filterKey] ? "active" : ""}`}>
        {icon}
        <span>{title}</span>
        <select onChange={(event) => go({ [filterKey]: event.target.value || undefined } as Partial<Record<keyof ActivityFilterState, string | number | boolean | undefined>>)} value={filters[filterKey] ?? ""}>
          <option value="">{title}</option>
          {filterOptions.map((option) => (
            <option key={option.value} value={option.value}>
                {option.label}
            </option>
          ))}
        </select>
      </label>
    );
  }

  function renderDateSelect() {
    return (
      <label className={`filter-select-menu date-select-menu ${filters.start ? "active" : ""}`}>
        <CalendarDays size={14} />
        <span>Vanaf</span>
        <input onChange={(event) => go({ period: undefined, start: event.target.value || undefined })} type="date" value={filters.start ?? ""} />
      </label>
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
      <div className="filter-menu-row">
        {renderFilterSelect("Categorie", <Filter size={14} />, "category", options.categories)}
        {renderFilterSelect("Locatie", <MapPin size={14} />, "location", locationOptions)}
        {renderFilterSelect("Type", <Store size={14} />, "type", typeOptions)}
        {renderFilterSelect("Binnen/Buiten", <CalendarDays size={14} />, "indoorOutdoor", indoorOutdoorOptions)}
        {renderFilterSelect("Organisator", <Store size={14} />, "organizer", organizerOptions)}
        {renderDateSelect()}
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
