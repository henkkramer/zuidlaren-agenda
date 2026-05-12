# Zuidlaren Agenda — UI Build Instructions

## 1. Purpose

Build the **Zuidlaren Agenda** web app as a calm, premium, mobile-first local activity agenda.

The chosen visual direction is a **hybrid between Local Magazine Cards and Clean**:

- Use the **large, emotional, image-rich visual style** from Proposal 2.
- Use the **large, highly visible date block** from Proposal 1.
- Keep the interface calm, trusted, local, and non-social.
- The first screen must be the public activity feed.
- Browsing must work without login.
- Login is only required for personal agenda and attendance actions.

The product must feel like:

> A premium local magazine-style agenda, but with the clarity and trust of a public village calendar.

---

## 2. Core Product Principles

### Must-have principles

1. **Public agenda first**
   - The homepage opens directly into the activity feed.
   - No marketing landing page before the feed.
   - No login wall for browsing.

2. **Mobile-first**
   - Primary design target is iPhone-sized web usage.
   - Desktop can be responsive, but mobile is the canonical UX.

3. **Cards are the core interface**
   - Activities appear as rich cards.
   - Cards use large images.
   - Each card has a prominent date badge.
   - The collapsed card must be scannable within 2 seconds.

4. **No social media mechanics**
   - No comments.
   - No likes.
   - No followers.
   - No chat.
   - No public profile feed.
   - No algorithmic engagement bait.

5. **“Ik ga” is not a reservation**
   - It means interest / attendance indication.
   - It does not guarantee capacity or a formal booking.
   - Attendance visibility is private by default.
   - Public attendance is opt-in per activity.

6. **Trust over monetization**
   - Paid features must never make the feed feel like ads.
   - Businesses must be approved before publishing.
   - Admin moderation must be available from MVP.

---

## 3. Visual Direction

## Name

**Zuidlaren Agenda — Premium Local Cards**

## Visual keywords

- warm
- local
- editorial
- premium
- calm
- trustworthy
- accessible
- image-rich
- mobile-first
- non-social

## Overall look

Use a warm off-white / cream background with dark green and warm orange accents.

The UI should look more like a refined local guide than a generic SaaS dashboard.

### Inspiration from selected mockup

The desired mockup contains:

- large iPhone-style home screen
- rich photographic event cards
- big date badges overlaying each image
- dark gradient overlays on images for readability
- clear filter chips
- warm serif typography for headings
- clean sans-serif typography for UI text
- personal agenda panel
- filter panel
- style guide section with colors, typography and icons

---

## 4. Color System

Use this palette as the basis.

```css
:root {
  --color-green-deep: #23422A;
  --color-green-main: #4F6F46;
  --color-orange-warm: #E8A13B;
  --color-cream: #F4EDE3;
  --color-surface: #F8F6F1;
  --color-charcoal: #2D2D2D;

  --color-border: rgba(45, 45, 45, 0.12);
  --color-muted-text: rgba(45, 45, 45, 0.65);
  --color-soft-green-bg: rgba(79, 111, 70, 0.14);
  --color-soft-orange-bg: rgba(232, 161, 59, 0.18);
}
```

## Usage

| Token | Use |
|---|---|
| `--color-green-deep` | Main logo text, primary navigation, primary buttons |
| `--color-green-main` | Active filters, active icons, secondary green accents |
| `--color-orange-warm` | Agenda wordmark, highlights, category accents |
| `--color-cream` | Page background |
| `--color-surface` | Cards, panels, sheets |
| `--color-charcoal` | Main text |

Do **not** use bright blue as the main brand color. This product should not feel like a generic web app.

---

## 5. Typography

Use two-font hierarchy.

## Headings / titles

Use a warm editorial serif font.

Recommended options:

- `Playfair Display`
- `Lora`
- `Libre Baskerville`
- `Cormorant Garamond`

Preferred:

```css
font-family: 'Playfair Display', Georgia, serif;
```

Use this for:

- Zuidlaren Agenda wordmark
- large activity titles
- hero title
- section headers where appropriate

## UI and body text

Use a clean sans-serif font.

Recommended options:

- `Inter`
- `Manrope`
- `System UI`

Preferred:

```css
font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
```

Use this for:

- filters
- body text
- buttons
- metadata
- forms
- admin UI

---

## 6. Global Layout

## Mobile viewport

Design primarily for:

```text
Width: 375px to 430px
Height: variable
```

Use a max mobile content width:

```css
.mobile-shell {
  width: 100%;
  max-width: 430px;
  margin: 0 auto;
}
```

## Page background

Use warm cream:

```css
body {
  background: var(--color-cream);
  color: var(--color-charcoal);
}
```

## Main spacing

```css
--space-xs: 4px;
--space-sm: 8px;
--space-md: 12px;
--space-lg: 16px;
--space-xl: 24px;
--space-2xl: 32px;
```

## Card radius

Use large rounded corners:

```css
--radius-card: 22px;
--radius-panel: 24px;
--radius-pill: 999px;
```

## Shadow

Soft only. No harsh material-design shadows.

```css
--shadow-soft: 0 12px 30px rgba(35, 66, 42, 0.10);
--shadow-card: 0 10px 24px rgba(45, 45, 45, 0.12);
```

---

## 7. Main Screens

Build at least these screens/components.

## 7.1 Public Agenda Feed

Route:

```text
/
```

Purpose:

Public browsing of all activities.

Must work without login.

### Header layout

At top:

```text
[menu icon]    Zuidlaren Agenda    [search icon]
```

Logo styling:

- “Zuidlaren” in deep green serif.
- “Agenda” can be orange serif or included in the full header title depending on space.

### Primary filter chips

Immediately below header:

```text
[Vandaag] [Dit weekend] [Deze week]
```

Rules:

- Active chip is deep green background with white text.
- Inactive chips are white / cream with subtle border.
- Chips must be thumb-friendly.

### Secondary filter chips

Below primary filters:

```text
[Categorie] [Locatie] [Type] [Datum]
```

Each opens a bottom sheet or filter panel.

### Feed cards

Cards use the visual style described in section 8.

The feed should support endless scroll.

---

## 7.2 Activity Detail Screen / Expanded Card

Route suggestion:

```text
/activity/:id
```

Or use an expanded card modal/sheet in MVP.

The detail screen should feel like a continuation of the card, not a separate admin page.

### Layout

Top:

- large image banner
- back button overlay
- share icon
- save icon
- large date badge overlay

Below image:

- title
- location
- category chips
- short summary
- practical information
- organizer
- original website link
- attendance controls

### Practical information block

Use icon + label rows:

```text
Praktische informatie

[clock] Zaterdag 18 mei 2024
        14:00 – 17:00

[pin]   Brink, Zuidlaren
        Bekijk op kaart

[user]  Organisator
        Ondernemersvereniging Zuidlaren

[link]  Meer informatie
        www.example.nl
```

### Attendance block

```text
Ik ga

[lock icon] Alleen zichtbaar voor mij
[group icon] Publiek zichtbaar bij deze activiteit

[Ik ga]
```

Rules:

- Default visibility is private.
- Public visibility must be an explicit choice.
- Wording must avoid social-network vibes.

### Source link button

At bottom:

```text
[Open originele website] [external-link icon]
```

---

## 7.3 My Agenda

Route:

```text
/my-agenda
```

Requires login.

Purpose:

Show activities the user has saved or marked with “Ik ga”.

### Layout

Top panel:

```text
Mijn agenda           [settings icon]

[Vandaag] [Dit weekend] [Later]
```

Group activities by date:

```text
Vandaag · Vrijdag 17 mei
- compact saved activity card

Zaterdag 18 mei
- compact saved activity card
- compact saved activity card
```

### Compact saved activity card

```text
┌────────────────────────────┐
│ [date block] [thumbnail]   │
│             Title          │
│             Location       │
│             Category chip  │
│                  [save icon]│
└────────────────────────────┘
```

Show privacy status:

```text
Privé
```

or:

```text
Publiek
```

Do not show likes, friend activity, comments, or follower context.

---

## 7.4 Filter Panel

Can be a side panel on desktop and bottom sheet on mobile.

In the selected visual direction, the filter panel can be shown as a card/panel next to mockups on desktop, but in production mobile it should be a bottom sheet.

### Sections

```text
Filter activiteiten

Datum
[Vandaag] [Dit weekend] [Deze week]
[Kies datum]

Categorie
[Alle] [Cultuur] [Muziek] [Sport]
[Markt] [Kinderen] [Eten & drinken] [Natuur]

Locatie
[Alle locaties v]

[Toon 128 activiteiten]
```

### Rules

- Filters should be fast.
- Do not require exact search input for common use.
- Chips and icons should be clear.
- Use green active states.

---

## 7.5 Business Dashboard

Route:

```text
/business
```

Requires business account.

Purpose:

Allow approved businesses to create, publish and manage activities.

### Dashboard structure

```text
Mijn organisatie

[+ Nieuwe activiteit]

Tabs:
[Concepten] [Gepubliceerd] [Verlopen]

Activity list:
- title
- date
- status
- quick actions
```

### Activity editor fields

Required:

- title
- short description, max 3 lines in card preview
- long description
- date
- start time
- end time
- location
- category
- type
- banner image
- source/original website URL

Optional:

- capacity
- availability
- recurring event, not MVP unless already planned
- notification campaign, v1/v2 only

### Important UX requirement

The editor must include a **live public card preview**.

Businesses should immediately see how the card will look in the public feed.

---

## 7.6 Platform Admin

Route:

```text
/admin
```

Requires admin role.

Purpose:

Protect trust and content quality.

### Admin modules

MVP admin should include:

- users
- businesses
- business approval
- activities
- categories
- locations
- reports
- audit logs
- feature flags

### Admin dashboard structure

```text
Platform beheer

Te beoordelen
- Bedrijven
- Activiteiten
- Meldingen

Beheer
- Gebruikers
- Organisaties
- Activiteiten
- Categorieën
- Locaties
- Feature flags
- Audit logs
```

Admin UI can be more functional and less editorial, but should still use the same color and typography system.

---

## 8. Activity Card Component

This is the most important component in the product.

## 8.1 Large visual card

Use this for the public feed.

### Layout

```text
┌────────────────────────────────┐
│                                │
│  [large image]                 │
│                                │
│  ┌───────┐                     │
│  │ ZA    │                     │
│  │ 18    │                     │
│  │ MEI   │                     │
│  │ 14:00 │                     │
│  └───────┘                     │
│                                │
│  Lentemarkt Zuidlaren          │
│  [pin] Brink, Zuidlaren        │
│                                │
│  [Markt] [Buiten] [Gratis]     │
│                                │
│  Lokale markt met muziek, eten │
│  en activiteiten voor het hele │
│  gezin.                        │
│                                │
│                         [save] │
└────────────────────────────────┘
```

## 8.2 Date badge

The date badge must be highly visible.

### Design

```css
.date-badge {
  width: 72px;
  min-height: 96px;
  border-radius: 14px;
  background: rgba(248, 246, 241, 0.96);
  color: var(--color-charcoal);
  box-shadow: 0 8px 20px rgba(0,0,0,0.16);
  overflow: hidden;
}

.date-badge-dayname {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.date-badge-day {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 34px;
  line-height: 1;
  font-weight: 700;
}

.date-badge-month {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.date-badge-time {
  background: var(--color-green-deep);
  color: white;
  font-size: 14px;
  font-weight: 700;
  padding: 6px 0;
  text-align: center;
}
```

### Content example

```text
ZA
18
MEI
14:00
```

### Placement

On large cards:

- overlay on the image
- left side
- around 24px from left
- around 40–50% down from top, depending on image composition

On detail pages:

- overlay near bottom-left of the hero image

On compact cards:

- use smaller version, still clearly visible

---

## 8.3 Image overlay

To keep text readable on image cards, use a bottom gradient.

```css
.activity-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0,0,0,0.05) 0%,
    rgba(0,0,0,0.15) 45%,
    rgba(0,0,0,0.68) 100%
  );
  pointer-events: none;
}
```

Text over the image should be white or near-white.

Use dark text only in detail pages where the content sits below the image on a light background.

---

## 8.4 Text limits on collapsed cards

Collapsed cards must show:

- title
- location
- category/type chips
- max 3 lines of description

Use CSS line clamp:

```css
.card-description {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

---

## 8.5 Card actions

Primary actions:

- Save / bookmark icon
- “Ik ga” on detail view or expanded card
- “Meer info” when using explicit card buttons

For visual magazine cards, avoid too many visible buttons on the card. Keep the feed clean.

Preferred:

- tap card opens details
- bookmark icon saves
- “Ik ga” appears in detail screen

---

## 9. Navigation

Use a bottom navigation bar on mobile.

```text
[Agenda] [Zoeken] [Mijn agenda] [Inloggen/Profile]
```

Rules:

- Agenda is default active tab.
- “Mijn agenda” requires login.
- If not logged in and user taps Mijn agenda, show login/register flow.
- Keep icons simple line icons.
- Use green active state.

---

## 10. Icon Style

Use clean rounded line icons.

Recommended icon library:

```text
lucide-react
```

Use icons for:

- calendar
- location pin
- bookmark
- user/group
- lock
- external link
- filter
- search
- menu
- settings
- store/business
- category icons

Icon style:

```css
.icon {
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}
```

Avoid filled social-media-style icons.

---

## 11. Example Data Model

Use this shape for frontend mock data and API contract alignment.

```ts
export type Activity = {
  id: string;
  title: string;
  shortDescription: string;
  longDescription?: string;
  imageUrl: string;
  startDateTime: string;
  endDateTime?: string;
  locationName: string;
  address?: string;
  category: ActivityCategory;
  typeTags: string[];
  organizerName: string;
  sourceUrl?: string;
  capacity?: number;
  availability?: number;
  isFeatured?: boolean;
  businessId: string;
  status: 'draft' | 'pending_review' | 'published' | 'rejected' | 'expired';
  createdAt: string;
  updatedAt: string;
};

export type ActivityCategory =
  | 'cultuur'
  | 'muziek'
  | 'sport'
  | 'markt'
  | 'kinderen'
  | 'eten_drinken'
  | 'natuur'
  | 'overig';

export type UserActivityStatus = {
  activityId: string;
  userId: string;
  status: 'saved' | 'going';
  visibility: 'private' | 'public';
  createdAt: string;
  updatedAt: string;
};
```

---

## 12. Example Mock Activities

Use realistic local placeholder activities.

```ts
export const mockActivities: Activity[] = [
  {
    id: 'lentemarkt-zuidlaren',
    title: 'Lentemarkt Zuidlaren',
    shortDescription: 'Lokale markt met muziek, eten en activiteiten voor het hele gezin.',
    longDescription: 'Kom langs en geniet van lokale producten, gezellige kramen, muziek en activiteiten voor jong en oud.',
    imageUrl: '/images/events/lentemarkt.jpg',
    startDateTime: '2026-05-18T14:00:00+02:00',
    endDateTime: '2026-05-18T17:00:00+02:00',
    locationName: 'Brink, Zuidlaren',
    category: 'markt',
    typeTags: ['Buiten', 'Gratis'],
    organizerName: 'Ondernemersvereniging Zuidlaren',
    sourceUrl: 'https://example.nl/lentemarkt',
    businessId: 'ondernemersvereniging-zuidlaren',
    status: 'published',
    createdAt: '2026-05-01T10:00:00+02:00',
    updatedAt: '2026-05-10T10:00:00+02:00'
  },
  {
    id: 'voorlezen-bibliotheek',
    title: 'Voorlezen in de Bibliotheek',
    shortDescription: 'Gezellig voorlezen voor kinderen van 3 t/m 7 jaar.',
    imageUrl: '/images/events/voorlezen.jpg',
    startDateTime: '2026-05-19T11:00:00+02:00',
    endDateTime: '2026-05-19T12:00:00+02:00',
    locationName: 'Bibliotheek Zuidlaren',
    category: 'kinderen',
    typeTags: ['Binnen', 'Gratis'],
    organizerName: 'Bibliotheek Zuidlaren',
    businessId: 'bibliotheek-zuidlaren',
    status: 'published',
    createdAt: '2026-05-01T10:00:00+02:00',
    updatedAt: '2026-05-10T10:00:00+02:00'
  },
  {
    id: 'muziekavond-brink',
    title: 'Muziekavond op de Brink',
    shortDescription: 'Een ontspannen avond met live muziek, eten en sfeer op de Brink.',
    imageUrl: '/images/events/muziekavond.jpg',
    startDateTime: '2026-05-18T20:00:00+02:00',
    endDateTime: '2026-05-18T22:30:00+02:00',
    locationName: 'Brink, Zuidlaren',
    category: 'muziek',
    typeTags: ['Buiten', 'Gratis'],
    organizerName: 'Cultuur aan de Brink',
    businessId: 'cultuur-aan-de-brink',
    status: 'published',
    createdAt: '2026-05-01T10:00:00+02:00',
    updatedAt: '2026-05-10T10:00:00+02:00'
  }
];
```

---

## 13. Component List

Build the frontend around these components.

```text
AppShell
MobileHeader
BottomNavigation
PrimaryFilterChips
SecondaryFilterChips
ActivityCardLarge
ActivityDateBadge
ActivityDetailView
ActivityPracticalInfo
AttendanceControl
MyAgendaView
CompactAgendaCard
FilterSheet
CategoryIconGrid
BusinessDashboard
ActivityEditor
ActivityPreviewCard
AdminDashboard
AdminReviewQueue
```

---

## 14. Interaction Rules

## Activity card tap

- Tapping the card opens detail view.
- Tapping bookmark saves the activity.
- If user is not logged in, show auth prompt.

## “Ik ga”

- Available from detail view.
- Requires login.
- Default visibility is private.
- User can opt into public visibility for that activity.

## Filters

- Filters should update feed immediately.
- Filter state should be reflected in URL query parameters.

Example:

```text
/?date=today&category=markt&location=brink
```

## Search

- Search should cover title, location, organizer, category and description.
- Search must not replace quick filters.

---

## 15. Accessibility Requirements

Minimum:

- All tap targets at least 44px high.
- Sufficient color contrast.
- Text readable over images using gradient overlay.
- Cards must have semantic buttons/links.
- Keyboard navigation must work on desktop.
- Images require alt text.
- Date badge information must also be readable by screen readers.

Example screen reader label:

```text
Zaterdag 18 mei, 14:00, Lentemarkt Zuidlaren, Brink Zuidlaren
```

---

## 16. MVP Scope

Build these in MVP:

### Public

- public activity feed
- mobile-first activity cards
- expand/detail view
- date/category/location/type filters
- search
- endless scroll or paginated loading

### User

- account
- save activity
- “Ik ga”
- private-by-default attendance
- personal agenda
- public/private visibility per activity

### Business

- business account
- owner role
- employee role
- approved businesses can publish
- create/edit/publish activities
- live public card preview

### Admin

- manage users
- manage businesses
- approve businesses
- manage activities
- manage categories
- manage reports
- audit logs
- feature flags

### Deployment

- Docker Compose local deployment

---

## 17. Out of Scope for MVP

Do not build these in MVP unless explicitly requested later:

- native iOS app
- native Android app
- comments
- likes
- followers
- chat
- direct messaging
- formal reservations
- ticketing
- automated scraping
- paid promotions
- web push
- recurring events
- public API for mobile apps

---

## 18. Recommended Tech Stack

This section can be adapted, but a good default is:

```text
Frontend: Next.js / React
Styling: Tailwind CSS
Icons: lucide-react
Database: PostgreSQL or SQLite for early local MVP
ORM: Prisma or Drizzle
Auth: Auth.js / Lucia / custom session auth
Deployment: Docker Compose
```

If the first implementation is local and simple, SQLite is acceptable.

If multi-business production use is expected soon, use PostgreSQL.

---

## 19. Tailwind Theme Direction

Example Tailwind theme extension:

```ts
export default {
  theme: {
    extend: {
      colors: {
        brand: {
          greenDeep: '#23422A',
          green: '#4F6F46',
          orange: '#E8A13B',
          cream: '#F4EDE3',
          surface: '#F8F6F1',
          charcoal: '#2D2D2D'
        }
      },
      borderRadius: {
        card: '22px',
        panel: '24px'
      },
      boxShadow: {
        soft: '0 12px 30px rgba(35, 66, 42, 0.10)',
        card: '0 10px 24px rgba(45, 45, 45, 0.12)'
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  }
};
```

---

## 20. Visual Acceptance Criteria

The implementation is visually acceptable when:

- the homepage looks close to a premium local magazine agenda
- activity images dominate the feed, but do not hurt readability
- date badges are immediately visible
- the green/orange/cream palette is consistently applied
- cards feel warm and local, not corporate
- filters are easy to operate with one thumb
- “Ik ga” does not look like a social like button
- personal agenda feels private and practical
- admin/business screens feel controlled and trustworthy

---

## 21. Functional Acceptance Criteria

The implementation is functionally acceptable when:

1. A visitor can browse activities without login.
2. A visitor can filter by date, category, location and type.
3. A visitor can open activity details.
4. A user can create an account.
5. A logged-in user can mark “Ik ga”.
6. “Ik ga” is private by default.
7. A user can choose public visibility per activity.
8. A user can view their personal agenda.
9. A business owner can create an activity.
10. A business employee can draft/edit activities without finance/admin access.
11. An approved business can publish activities.
12. A platform admin can approve businesses.
13. A platform admin can moderate activities.
14. Audit logging exists for admin/business critical actions.
15. The app can run locally through Docker Compose.

---

## 22. Copywriting Rules

Use Dutch UI text.

Preferred labels:

```text
Zuidlaren Agenda
Vandaag
Dit weekend
Deze week
Categorie
Locatie
Type
Datum
Ik ga
Alleen zichtbaar voor mij
Publiek zichtbaar bij deze activiteit
Open originele website
Mijn agenda
Voor organisaties
Nieuwe activiteit
Publiceren
Concept opslaan
```

Avoid:

```text
Like
Volgen
Followers
Reacties
Chat
Populair bij vrienden
Trending
```

The product should not feel like social media.

---

## 23. First Build Order

Recommended implementation order:

1. Static visual shell
2. Public feed with mock activity data
3. Large activity card component
4. Date badge component
5. Activity detail view
6. Filter chips and filter sheet
7. My Agenda static screen
8. Authentication
9. Save / “Ik ga” functionality
10. Business dashboard
11. Activity editor with live card preview
12. Admin moderation basics
13. Docker Compose deployment

---

## 24. One-Sentence Product Definition

**Zuidlaren Agenda is a calm, premium, mobile-first activity agenda where residents can discover what is happening nearby, save their own plans, and trusted local organizations can publish activities without the product becoming social media.**
