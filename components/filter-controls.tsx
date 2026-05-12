import { CalendarDays, Filter, MapPin, Store } from "lucide-react";

export function FilterControls() {
  return (
    <>
      <div className="chip-row">
        <button className="chip active">Vandaag</button>
        <button className="chip">Dit weekend</button>
        <button className="chip">Deze week</button>
      </div>
      <div className="secondary-filters">
        <button className="filter-chip">
          <Filter size={14} /> Categorie
        </button>
        <button className="filter-chip">
          <MapPin size={14} /> Locatie
        </button>
        <button className="filter-chip">
          <Store size={14} /> Type
        </button>
        <button className="filter-chip">
          <CalendarDays size={14} /> Datum
        </button>
      </div>
    </>
  );
}
