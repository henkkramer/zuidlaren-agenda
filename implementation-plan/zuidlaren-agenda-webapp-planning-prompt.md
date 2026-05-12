# Zuidlaren Agenda Webapp — Product & Implementation Planning Prompt

## Role

You are a senior software architect, product manager, UX designer, full-stack engineer, and pragmatic startup CTO.

You understand:

- modern webapps
- mobile-first UX
- event/agenda platforms
- marketplace-style business dashboards
- AI-assisted content creation
- staged product delivery
- local-first testing on Linux
- future iOS/Android app migration
- scalable SaaS architecture

Your task is to create a complete implementation plan for a new local activity agenda platform for **Zuidlaren, The Netherlands**.

The output must be a **single Markdown document** first, followed by a structured set of implementation-plan files.

---

# 1. Product Vision

I live in **Zuidlaren**, a village with many activities, events, clubs, shops, hospitality venues, sports, cultural initiatives, and local organizations.

The problem: there is no clear, modern, central, easy-to-use agenda where residents can quickly discover what is happening.

The goal is to build a beautiful, mobile-first webapp first, with the possibility to later turn it into native iOS and Android apps.

The platform should feel local, friendly, premium, simple, and trustworthy. It should **not become social media**.

The core concept:

> A clean, visual, scrollable agenda of activity cards for Zuidlaren, where users can discover events, say “I’m going”, and businesses or organizations can publish activities.

---

# 2. Target Users

## 2.1 Visitors / Residents

Residents of Zuidlaren and nearby areas who want to know what is happening.

They should be able to:

- browse events without friction
- filter by date, activity type, location, and category
- open event cards for more information
- create an account
- mark that they are going to an activity
- choose whether that attendance is public or private
- manage their personal agenda
- receive optional notifications

## 2.2 Business Owners / Organizations

Examples:

- cafés
- restaurants
- shops
- sports clubs
- cultural organizations
- schools
- associations
- municipality-related initiatives
- local event organizers

They should be able to:

- create activity cards
- publish events
- edit and unpublish events
- use AI help to improve event card text and visual presentation
- send paid last-minute notifications
- manage employees
- see basic analytics
- manage billing and subscription/payment settings

## 2.3 Business Employees

Employees can help manage activity cards, but should not see sensitive information.

They should be able to:

- create activity cards
- edit activity cards
- submit or publish cards depending on permissions
- use AI assistance for content generation

They should **not automatically** be able to:

- see finances
- change billing settings
- manage owner-level settings
- delete the business account

## 2.4 Platform Admin

This is my own admin backend.

I need to manage:

- users
- businesses
- activity cards
- reports / abuse moderation
- categories
- locations
- AI integrations
- finance/payment integrations
- subscriptions or paid promotion products
- notification campaigns
- app/site settings
- future API keys
- logs and diagnostics

---

# 3. Core Product Requirements

## 3.1 Public Agenda

The public agenda should be the main experience.

It should be:

- mobile-first
- fast
- visually attractive
- simple
- endless-scroll based
- filterable
- accessible
- usable as a PWA
- suitable for later reuse in iOS/Android apps

The agenda consists of interactive cards.

---

# 4. Activity Card Requirements

Each activity must be displayed as a beautiful card.

## 4.1 Collapsed Card View

Each card should show:

- banner image or generated visual
- title
- location
- date and time
- short description, maximum 3 lines
- activity type / category
- optional capacity indicator
- optional availability indicator
- clear visual state if the user is already going
- optional business/organizer name

The card must be compact but visually appealing.

The card should work well on:

- iPhone-sized screens
- Android phones
- tablets
- desktop browsers

## 4.2 Expanded Card View

When clicked or tapped, the card should fold open or expand.

Expanded view should show:

- full description
- location details
- map link if available
- organizer details
- capacity and availability if applicable
- “I’m going” button
- public/private attendance toggle
- original source link
- share link
- report/problem option
- optional contact information
- optional external ticket/reservation link

Important:

The platform’s “I’m going” feature is **not a formal reservation system**. It is only an indication of attendance or interest.

Use clear wording such as:

- “Ik ga”
- “Misschien”
- “Niet meer gaan”
- “Maak zichtbaar voor anderen”
- “Alleen privé opslaan”

Avoid suggesting that this guarantees a spot unless the organizer explicitly links to an external booking system.

---

# 5. Browsing and Filtering

The agenda must support endless scroll.

Filters should include at minimum:

- date
- today
- tomorrow
- this weekend
- this week
- custom date range
- location
- activity type
- category
- free / paid
- family / children
- indoor / outdoor
- availability
- organizer
- distance from Zuidlaren center, optional later

Search should include:

- title
- description
- organizer
- location
- tags

Recommended behavior:

- filters should update the card feed quickly
- filters should be usable on mobile
- active filters should be visible as removable chips
- filter state should be shareable via URL
- endless scroll should be performant and SEO-aware

---

# 6. User Accounts

Users can create an account.

Authentication options should be recommended by the architect.

Consider:

- email/password
- magic link
- Google login
- Apple login, important for future iOS app
- passkeys later

Users should be able to:

- view their personal agenda
- see events they marked as going
- remove themselves from events
- choose public/private visibility per event
- manage notification preferences
- manage profile name
- delete their account
- export their data if needed

Privacy is important.

This should not become social media.

Do not add:

- public feeds
- likes
- comments
- follower systems
- direct messaging
- popularity ranking based on personal profiles

Allowed:

- optional public indication that someone is going
- aggregated attendance count
- “friends are going” only as a possible future feature, not MVP

---

# 7. Personal Agenda Page

Each user should have a personal page that looks similar to the public agenda.

It should show cards for activities they have signed up to.

Requirements:

- endless scroll
- same filter logic as public agenda
- filter by time, location, type, category
- show upcoming first
- optionally show past activities
- allow public/private toggle per card
- allow cancellation/removal from personal agenda
- allow add-to-calendar export later

Future feature:

- export to Apple Calendar, Google Calendar, Outlook, or ICS feed

---

# 8. Business Backend

Businesses and local organizations need their own backend.

## 8.1 Business Account

A business account should contain:

- business name
- owner user
- address
- contact details
- website
- logo
- default banner style
- default categories
- subscription/payment status
- employees
- published activities
- draft activities
- analytics
- notification credits or paid notification options

## 8.2 Roles

At minimum two business roles are needed.

### Business Owner Admin

Can:

- manage all business settings
- manage employees
- see billing/finance
- create/edit/publish/delete activities
- use AI card builder
- send paid notifications
- see analytics

### Business Employee

Can:

- create cards
- edit cards
- use AI card builder
- publish cards, if permission is enabled
- view published and draft cards

Cannot by default:

- see finances
- change subscription
- manage owner-level settings
- delete business account
- manage payment methods

Recommend a flexible RBAC or permission model, because more roles may be needed later.

Possible later roles:

- finance user
- content editor
- event manager
- read-only analyst
- municipality moderator

---

# 9. Activity Creation Backend

Business users need a clean form to create cards.

Fields:

- title
- short description, max 3 lines
- full description
- category
- type
- location
- address
- start date/time
- end date/time
- recurring event options, future
- banner image
- capacity, optional
- availability, optional
- external link
- ticket/reservation link, optional
- organizer contact
- visibility status:
  - draft
  - scheduled
  - published
  - unpublished
  - expired
- tags
- notification options

The backend should validate:

- date/time consistency
- title length
- short description length
- missing location
- duplicate events
- broken links
- inappropriate content, optional AI moderation later

---

# 10. AI Card Assistance

The business backend should include AI-assisted card creation.

The AI assistant should help with:

- rewriting the title
- shortening text to fit the 3-line card description
- creating a more attractive event description
- suggesting tags
- suggesting category/type
- generating Dutch copy
- optionally generating English/German summaries later
- suggesting a banner prompt
- checking clarity
- checking whether the event contains date/location/time
- improving tone while keeping it local and friendly

Important:

The AI should assist, not auto-publish without user review.

Recommended UX:

- “Verbeter tekst”
- “Maak korter”
- “Maak enthousiaster”
- “Maak formeler”
- “Maak geschikt voor gezinnen”
- “Maak een banner prompt”
- “Controleer op ontbrekende informatie”

The architect should recommend:

- which AI API to use
- where to store prompts
- how to version prompts
- how to moderate generated content
- how to limit usage/costs per business
- how to track AI usage for billing or fair-use limits

---

# 11. Notifications

Businesses should be able to notify users about last-minute events.

This is a paid feature.

Notification types to consider:

- web push notifications
- email notifications
- future mobile push notifications for iOS/Android
- optional WhatsApp integration later, only if legally and technically sensible

Important:

Users must opt in.

Users should control:

- whether they receive notifications
- categories they want
- locations they want
- urgent/last-minute notifications
- frequency limits

Businesses should not be allowed to spam users.

Recommended platform controls:

- notification approval rules
- rate limits
- paid notification credits
- anti-spam logic
- admin review for new businesses
- abuse reporting
- notification logs

The implementation plan should propose a staged notification system:

1. email notifications
2. web push
3. mobile push when native apps exist

---

# 12. Monetization

Recommend a realistic monetization model.

Possible models:

- free basic event publishing
- paid promoted event
- paid last-minute notification
- subscription for businesses
- monthly business package
- pay-per-notification
- premium analytics
- featured placement
- sponsored category, with strict limits
- municipality/community sponsorship

Avoid making the app feel commercial or spammy.

The user experience must remain clean and trustworthy.

---

# 13. Finance / Payment Integrations

Suggest integrations that should not all be built manually.

Consider:

## Payment Providers

Recommend suitable providers for the Dutch/EU market:

- Stripe
- Mollie
- Adyen, likely too heavy for MVP
- PayPal, optional but not primary

Evaluate:

- iDEAL support
- credit card support
- SEPA support
- subscriptions
- invoice support
- webhooks
- developer experience
- EU/VAT support

## Accounting / Finance Apps

Suggest possible integrations:

- Moneybird
- Exact Online
- Twinfield
- e-Boekhouden.nl
- AFAS, likely too heavy for MVP
- Visma, optional

Recommend what should be integrated first and what can wait.

MVP recommendation likely:

- Mollie or Stripe for payments
- Moneybird or Exact Online later for bookkeeping
- simple internal billing records first
- proper webhook event log from day one

The architect should give a clear recommendation.

---

# 14. Platform Admin Backend

I need a platform admin backend.

It should include:

## 14.1 User Management

- view users
- search users
- disable users
- delete users
- see consent status
- see notification preferences
- view public/private attendance records where legally allowed
- GDPR export/delete tools later

## 14.2 Business Management

- approve businesses
- suspend businesses
- manage business plans
- view billing status
- assign owner
- manage employees if needed
- see event volume
- see notification usage

## 14.3 Event Management

- view all events
- edit or unpublish events
- moderate content
- manage categories
- manage tags
- manage locations
- detect duplicates
- handle reports

## 14.4 AI Management

- configure AI provider
- configure model
- manage prompt templates
- view AI usage
- set business usage limits
- monitor cost
- enable/disable AI features

## 14.5 Finance Management

- view plans
- view transactions
- view paid notification credits
- view invoices/payment events
- refund/credit handling, if supported by payment provider
- export data

## 14.6 System Management

- feature flags
- audit logs
- error logs
- background job status
- notification queues
- integration status
- API keys, securely stored
- app configuration

---

# 15. Technical Environment

The test app will be built locally on a Linux server and tested over a Tailscale network.

Test hostname:

```text
mb-linux.sailfish-musical.ts.net
```

The architect should design for:

- local Linux server deployment
- Docker-based deployment
- reverse proxy compatibility
- Tailscale-only testing
- later public internet deployment
- later mobile app backend API reuse

Assume:

- the server can run Docker Compose
- the webapp should be accessible through HTTPS via reverse proxy or Tailscale Serve
- the first version can use local volumes and a simple database
- the architecture should not block scaling later

---

# 16. Recommended Architecture

Propose a future-proof but realistic architecture.

The recommendation should include:

## 16.1 Frontend

Evaluate and recommend:

- Next.js
- React
- Vue/Nuxt
- SvelteKit

Consider:

- mobile-first UI
- SEO for public events
- server-side rendering
- PWA support
- future API reuse
- developer productivity
- suitability for Claude Code / Codex implementation

Likely recommended direction:

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui or similar
- PWA support
- responsive card-based UI

But evaluate properly.

## 16.2 Backend

Recommend backend approach:

Options:

- Next.js full-stack API routes/server actions
- NestJS separate backend
- Fastify/Express separate backend
- Django/FastAPI alternative

Decide what is best for MVP and future scale.

Important:

- the code should stay maintainable
- admin/backend routes should be clearly separated
- future native apps should be able to use the API
- authentication and RBAC must be serious from the beginning

## 16.3 Database

Evaluate:

- PostgreSQL
- SQLite for local MVP
- MySQL/MariaDB
- hosted Postgres later

Recommendation likely:

- PostgreSQL from the start, even locally, because the model includes users, businesses, roles, events, attendance, payments, notifications, and audit logs.

Use an ORM/migration layer.

Evaluate:

- Prisma
- Drizzle
- TypeORM

Recommend one.

## 16.4 Auth

Recommend:

- Auth.js / NextAuth
- Clerk
- Supabase Auth
- Lucia or custom auth
- Firebase Auth

Evaluate:

- cost
- self-hosting
- Apple login later
- RBAC integration
- simplicity
- vendor lock-in

## 16.5 File Storage

For banner images/logos:

- local storage for MVP
- S3-compatible storage later
- MinIO locally if useful
- Cloudflare R2, AWS S3, Backblaze B2 later

## 16.6 Background Jobs

Needed for:

- notification sending
- AI processing
- image generation jobs
- scheduled publishing
- cleanup
- webhook processing

Evaluate:

- simple cron jobs
- BullMQ + Redis
- pg-boss
- Temporal, likely too heavy for MVP

Recommend pragmatic option.

## 16.7 Notifications

Recommend technical stack for:

- email
- web push
- mobile push later

Possible providers:

- Resend
- Postmark
- SendGrid
- Mailgun
- Firebase Cloud Messaging
- Apple Push Notification Service later

## 16.8 Payments

Evaluate:

- Mollie
- Stripe

Give recommendation for Dutch local business use.

## 16.9 Analytics

Need privacy-friendly analytics.

Evaluate:

- Plausible
- Umami
- PostHog
- simple internal analytics

Recommend:

- what to track
- what not to track
- how to remain GDPR-conscious

---

# 17. GDPR, Privacy, and Legal Requirements

The platform operates in the Netherlands/EU.

The implementation plan must include GDPR-conscious design.

Important topics:

- user consent
- privacy policy
- cookie policy
- data minimization
- account deletion
- data export
- attendance visibility
- public/private attendance
- notification opt-in
- business data
- payment data
- AI provider data processing
- processor agreements
- audit logs
- retention periods
- abuse reporting
- children/family events sensitivity

Do not over-engineer legal functionality in MVP, but do not ignore it.

The platform should store only what is needed.

---

# 18. UX Design Direction

The UI should be:

- modern
- card-based
- friendly
- clean
- premium but local
- fast on mobile
- accessible
- not overloaded
- not social-media-like

Recommended design language:

- soft cards
- large readable typography
- nice banner images
- clear date chips
- location chips
- subtle category colors
- smooth expand/collapse
- sticky mobile filters
- bottom navigation for mobile
- simple admin dashboard layout
- clear status indicators

Public app navigation proposal:

- Agenda
- Search / Filters
- My Agenda
- Notifications
- Account

Business backend navigation proposal:

- Dashboard
- Activities
- Create Activity
- AI Assistant
- Notifications
- Analytics
- Employees
- Billing
- Settings

Platform admin navigation proposal:

- Overview
- Users
- Businesses
- Events
- Notifications
- AI
- Finance
- Moderation
- System

---

# 19. Data Model

Design a database schema.

At minimum include:

- User
- UserProfile
- Business
- BusinessMember
- Role
- Permission
- Activity
- ActivityCategory
- ActivityType
- Location
- Attendance
- NotificationPreference
- NotificationCampaign
- NotificationDelivery
- PaymentCustomer
- PaymentSubscription
- PaymentTransaction
- InvoiceReference
- AiUsageLog
- AiPromptTemplate
- MediaAsset
- AuditLog
- Report
- FeatureFlag

For every important model, define:

- purpose
- key fields
- relationships
- indexes
- privacy considerations

The implementation plan should provide the first version of the schema and migration approach.

---

# 20. API Design

Design the API surface.

Include endpoints or server actions for:

## Public

- list activities
- get activity details
- search/filter activities
- get categories
- get locations

## User

- register/login
- get profile
- update profile
- get my agenda
- mark going
- remove going
- update attendance visibility
- notification preferences

## Business

- create activity
- edit activity
- publish/unpublish activity
- duplicate activity
- upload banner/logo
- AI improve activity
- send notification campaign
- manage employees
- view analytics
- manage billing

## Platform Admin

- manage users
- manage businesses
- moderate activities
- configure AI
- manage categories
- view payments
- view logs

Include authentication and authorization rules.

---

# 21. Security Requirements

Include security from the beginning.

Cover:

- authentication
- authorization
- RBAC
- input validation
- file upload validation
- rate limiting
- CSRF protection
- XSS protection
- SQL injection prevention
- webhook signature verification
- AI prompt injection concerns
- secrets management
- audit logs
- admin action logs
- backup strategy
- dependency scanning
- Docker security basics

---

# 22. Deployment Requirements

The MVP should run locally on Linux.

Use Docker Compose.

At minimum include services such as:

- webapp
- database
- redis or job queue if selected
- object storage if selected
- reverse proxy optional
- adminer/db viewer optional for development only

The implementation plan should include:

- `.env.example`
- Docker Compose structure
- local domain/Tailscale access assumptions
- migration commands
- seed commands
- backup commands
- logging strategy
- health checks

Test hostname:

```text
https://mb-linux.sailfish-musical.ts.net
```

If HTTPS is not initially configured, clearly separate:

- local HTTP development
- Tailscale HTTPS
- production HTTPS

---

# 23. Implementation Strategy

This product must be built in steps.

Do not try to build everything at once.

Create a phased roadmap with implementation steps.

Each step must be small enough that Claude Code or Codex can implement and test it.

Each step must produce a separate `.md` file in this folder:

```text
implementation-plan/
```

Required output structure:

```text
implementation-plan/
  00-product-vision.md
  01-architecture-decision-record.md
  02-local-development-and-docker.md
  03-database-schema.md
  04-authentication-and-users.md
  05-public-agenda-feed.md
  06-activity-card-ui.md
  07-filtering-and-search.md
  08-user-personal-agenda.md
  09-business-backend.md
  10-business-roles-and-permissions.md
  11-ai-card-assistant.md
  12-notifications.md
  13-payments-and-billing.md
  14-platform-admin-backend.md
  15-media-storage.md
  16-analytics-and-observability.md
  17-gdpr-privacy-and-security.md
  18-testing-strategy.md
  19-deployment-tailscale-linux.md
  20-future-mobile-app-strategy.md
  21-mvp-scope-and-release-plan.md
```

Each `.md` file should contain:

- goal
- scope
- non-goals
- technical decisions
- implementation tasks
- database changes
- API changes
- frontend changes
- backend changes
- validation rules
- tests
- acceptance criteria
- risks
- open questions

---

# 24. MVP Definition

Define a strict MVP.

The MVP should probably include:

- public agenda page
- mobile-first activity cards
- expand/collapse cards
- filtering by date, location, category/type
- user account
- mark “I’m going”
- public/private attendance toggle
- personal agenda page
- business account
- business activity creation
- owner and employee role
- basic platform admin
- local Docker deployment
- PostgreSQL
- basic AI text helper
- basic email notification infrastructure, possibly admin-only initially

The MVP should probably exclude:

- native iOS/Android app
- advanced recommendations
- comments
- likes
- follower system
- chat
- complex ticketing
- full reservation system
- advanced accounting integration
- complex recurring events
- map-heavy UI
- marketplace features
- complicated social graph

Clearly define:

- MVP
- v1
- v2
- future

---

# 25. Deliverables Expected From You

Produce the final answer as a **single Markdown document**.

The Markdown document must include:

1. Executive summary
2. Product vision
3. Recommended architecture
4. Technology stack recommendation
5. UX recommendation
6. Data model
7. API design
8. Security/GDPR notes
9. Monetization/payment recommendation
10. AI integration recommendation
11. Local Linux/Tailscale deployment plan
12. Phased implementation roadmap
13. Exact list of `.md` files to create in `implementation-plan/`
14. Detailed content outline for every `.md` file
15. MVP scope
16. v1/v2/future scope
17. Concrete instructions for Claude Code or Codex to start building

---

# 26. Format Requirements

The output must be practical and implementation-ready.

Use:

- clear headings
- tables where useful
- bullet points
- architecture decisions
- concrete recommendations
- no vague startup language
- no unnecessary fluff

Be opinionated where needed.

If something is uncertain, state the assumption and recommend the safest practical choice.

Do not only ask questions. Make reasonable assumptions and continue.

Only ask questions at the end if they are truly blocking.

---

# 27. Important Product Constraints

- The app must not become social media.
- The “I’m going” feature is not a formal reservation.
- Public attendance is optional per activity per user.
- Businesses need role separation.
- Employees must not see finances by default.
- AI helps create better cards, but does not publish automatically.
- Notifications must be opt-in and rate-limited.
- Paid notifications must not create spam.
- The platform must be future-proof for native apps.
- The first build runs on a local Linux server over Tailscale.
- The implementation must be step-by-step.
- Every step must be separately documented in `implementation-plan/`.

---

# 28. Recommended Initial Technical Bias

Unless you have a stronger reason not to, start with this recommended stack:

## App

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Server Components where useful
- PWA-ready architecture

## Backend

- Next.js server actions/API routes for MVP
- Clear service-layer separation so a dedicated API backend can be introduced later if needed

## Database

- PostgreSQL
- Prisma ORM or Drizzle ORM; choose and justify
- migrations from day one

## Auth

- Auth.js / NextAuth or another recommended solution
- support email login first
- keep Apple/Google login possible later

## Background Jobs

- pg-boss or BullMQ; choose and justify
- keep it simple for local Docker deployment

## Payments

- Mollie or Stripe; choose and justify for Dutch local business use
- include webhook event logging from day one

## Email

- Resend or Postmark; choose and justify

## Web Push

- plan for later, do not force into MVP if too much

## Storage

- local volume for MVP
- S3-compatible abstraction for later
- optionally MinIO for local test if useful

## Hosting

- local Linux Docker Compose first
- Tailscale HTTPS access on:

```text
mb-linux.sailfish-musical.ts.net
```

## Production Later

- VPS or managed platform
- managed PostgreSQL
- object storage
- CDN
- real domain
- production email
- payment provider
- monitoring

---

# 29. Final Instruction

Create the implementation plan now.

The output should be directly usable as the first planning input for Claude Code or Codex.

After creating the overall plan, instruct Claude Code or Codex to create the folder:

```text
implementation-plan/
```

And then generate all step-by-step `.md` files listed above.

Each file must be written with enough implementation detail that a coding agent can execute it one step at a time without losing product direction.
