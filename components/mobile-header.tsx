import Link from "next/link";
import { BriefcaseBusiness, Search } from "lucide-react";

export function MobileHeader() {
  return (
    <div className="mobile-header">
      <Link className="icon-button" href="/business" aria-label="Business dashboard">
        <BriefcaseBusiness />
      </Link>
      <h2>Zuidlaren Agenda</h2>
      <button className="icon-button" aria-label="Zoeken">
        <Search />
      </button>
    </div>
  );
}
