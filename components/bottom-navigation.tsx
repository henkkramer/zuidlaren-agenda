import Link from "next/link";
import { Bookmark, CalendarDays, Search, UserRound } from "lucide-react";

export function BottomNavigation() {
  return (
    <nav className="bottom-nav" aria-label="Mobiele navigatie">
      <Link className="nav-item active" href="/">
        <CalendarDays size={20} /> Agenda
      </Link>
      <button className="nav-item">
        <Search size={20} /> Zoeken
      </button>
      <Link className="nav-item" href="/mijn-agenda">
        <Bookmark size={20} /> Mijn agenda
      </Link>
      <Link className="nav-item" href="/account">
        <UserRound size={20} /> Inloggen
      </Link>
    </nav>
  );
}
