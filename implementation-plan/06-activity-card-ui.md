# 06 - Activity Card UI

## Goal

Create the responsive activity card used in the public agenda and personal agenda.

## Scope

- Collapsed card.
- Expanded card.
- Attendance controls where user is logged in.
- Share/report entry points.

## Non-Goals

- Ticketing/reservation.
- Comments or reactions.
- Map-heavy UI.

## UX Requirements

Follow `example-UI.png` and `ui-build-instructions.md` closely as style and screen examples, not as literal device mockups. The target style is "Premium Local Cards": large emotional imagery, visible date badge, dark image gradient, warm cream page background, deep green/orange accents, Playfair-style serif titles, Inter-style UI text, and rounded local-magazine cards.

Collapsed card shows:

- Banner image or fallback visual.
- Title.
- Date/time.
- Location.
- Category/type.
- Short description capped visually to 3 lines.
- Organizer name when useful.
- Attendance state if logged in.

Expanded card shows:

- Full description.
- Location details and map link.
- Organizer details.
- Capacity/availability if present.
- `Ik ga`, `Misschien`, `Niet meer gaan`.
- Visibility toggle: `Alleen prive opslaan` / `Zichtbaar voor anderen`.
- External source/ticket link if present.
- Share link.
- Report option.

## Technical Decisions

- Use accessible buttons and disclosure semantics.
- Use shadcn/ui primitives where they fit.
- Keep card layout responsive through stable aspect ratios and fixed control sizing.
- No text should overflow buttons or chips on mobile.
- Use `lucide-react` icons.
- Use a 72px by 96px date badge on large cards with day name, day number, month, and green time footer.
- Keep feed cards visually clean: tapping the card opens details; bookmark/save is the only prominent inline action.

## Implementation Tasks

- Build reusable `ActivityCard`.
- Build `ActivityCardExpandedContent`.
- Build attendance action controls.
- Build category/date/location chips.
- Add fallback banner component.
- Add report/share buttons.

## Tests

- Card renders on mobile and desktop.
- Long titles/descriptions do not break layout.
- Expand/collapse is keyboard accessible.
- Attendance controls are hidden or prompt login for anonymous users.

## Acceptance Criteria

- Same card component works in public feed and personal agenda.
- Copy clearly avoids reservation guarantees.
- The homepage visually resembles the provided reference: cream background, phone-width feed, large photographic cards, green active chips, and strong date badges.
- Mobile renders as a real full-screen app layout, not inside a device frame.
- Desktop renders as a polished responsive web layout with agenda, detail, and utility panels.
