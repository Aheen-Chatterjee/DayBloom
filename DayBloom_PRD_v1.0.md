# (^._.^)~ DayBloom
## Product Requirements Document
### Personal Productivity & Reflection Platform

---

| | |
|---|---|
| **Document Type** | Product Requirements Document (PRD) |
| **Product Name** | DayBloom |
| **Version** | 1.0 — Initial Release |
| **Date** | March 2025 |
| **Status** | Draft — Awaiting Engineering Sign-off |
| **Tech Stack** | Next.js (Netlify) · FastAPI (Render) · Supabase |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Vision & Goals](#2-product-vision--goals)
3. [Scope & Constraints](#3-scope--constraints)
4. [Technical Architecture](#4-technical-architecture)
5. [Feature Requirements](#5-feature-requirements)
6. [UI / UX Design Specifications](#6-ui--ux-design-specifications)
7. [Demo User & Seed Data](#7-demo-user--seed-data)
8. [Deployment & Infrastructure](#8-deployment--infrastructure)
9. [Development Timeline](#9-development-timeline)
10. [Security & Privacy](#10-security--privacy)
11. [Testing Strategy](#11-testing-strategy)
12. [Open Questions & Decisions](#12-open-questions--decisions)
13. [Appendix](#13-appendix)

---

## 1. Executive Summary ✿(◠‿◠)

DayBloom is a maximalistic, warm-toned personal productivity and reflection platform that unifies **long-form journaling**, **habit tracking**, and **visual progress reporting** into a single delightful daily workflow. It is built for individuals who want to nurture intentional living through consistent self-reflection and habit formation.

The product is rooted in the belief that small, consistent actions — documented and celebrated daily — compound into meaningful life change. DayBloom gives users a beautiful "home base" to return to each day: write, check habits, and celebrate streaks.

### 1.1 Problem Statement

Modern productivity tooling is fragmented. Users maintain a separate note-taking app for journaling, a spreadsheet for habit tracking, and a mental model for streaks. The cognitive overhead of juggling multiple tools leads to abandonment. No single tool combines the **emotional warmth of a journal** with the **motivational mechanics of a habit tracker** in a visually cohesive, maximalistic interface.

### 1.2 Proposed Solution

DayBloom is a web application (mobile-responsive) providing:

- ✿ A rich daily journaling engine with timestamped, editable entries
- ✿ A habit management dashboard with custom habit creation
- ✿ A daily checklist view with one-tap habit completion
- ✿ Automated streak computation (current + longest streak per habit)
- ✿ A calendar/history view showing completed habits and journal entries per day
- ✿ A pre-seeded "Demo User" with 14+ days of realistic historical data

### 1.3 Target Users

**Primary Persona: "The Mindful Achiever"** — a knowledge worker (25–40) who values introspection, self-improvement, and beautiful interfaces. They have tried habit trackers before but abandoned them because they felt clinical. They keep a journal but in a disconnected notes app. They want one warm, inviting place.

---

## 2. Product Vision & Goals ✧(^‿^)✧

### 2.1 Vision Statement

> *"DayBloom is the warm, beautiful space where your thoughts and habits live together — helping you bloom, one day at a time."*

### 2.2 Success Metrics (KPIs)

| Metric | Target (90 days) | Measurement Method |
|---|---|---|
| D7 Retention | > 40% | Supabase auth events |
| Journal entries / user / week | > 3 | entry table query |
| Habit check-in rate | > 60% daily | completions / total habits |
| Streak ≥ 7 days achieved | > 25% of users | streak service logs |
| NPS Score | > 45 | in-app survey (day 30) |
| Page load (LCP) | < 1.5s | Netlify analytics |

### 2.3 Non-Goals (explicitly out of scope for v1)

This PRD does not cover push/email notifications, social features, native mobile apps, AI-powered journal insights, third-party integrations, or offline/PWA mode. These are v2+ considerations.

---

## 3. Scope & Constraints (⌐■_■)

### 3.1 In Scope — v1.0

- ★ Full journaling engine — create, read, update, soft-delete entries
- ★ Habit CRUD — create, edit, archive, delete habits
- ★ Daily checklist — mark habits complete/incomplete for today
- ★ Streak engine — current streak and longest streak per habit
- ★ History / Calendar view — per-day drill-down of habits + journal entries
- ★ Demo user seed script — 14 days of realistic AI-generated data
- ★ Authentication — email/password via Supabase Auth (no OAuth in v1)
- ★ Responsive design — desktop-first, mobile-usable

### 3.2 Out of Scope — v2+

- ☆ Push / email reminders and notifications
- ☆ Social features — sharing streaks, friend challenges
- ☆ Native mobile app (iOS / Android)
- ☆ AI-powered journal insights or mood analysis
- ☆ Integrations — Apple Health, Google Fit, Notion, etc.
- ☆ Offline / PWA mode
- ☆ Custom themes / dark mode

### 3.3 Constraints & Assumptions

- ◉ **Hosting:** Frontend on Netlify free tier; Backend on Render free tier (cold-start latency acceptable for v1)
- ◉ **Database:** Supabase free tier (500 MB, 2 GB bandwidth/month)
- ◉ **Auth:** Supabase Auth only — no third-party OAuth required in v1
- ◉ **Demo data:** The seed script is a first-class deliverable, not an afterthought
- ◉ **Media:** Images / rich media in journal entries are not supported in v1

---

## 4. Technical Architecture (ง•̀_•́)ง

### 4.1 System Overview

DayBloom follows a clean **three-tier architecture** with clear separation of concerns. The frontend is a statically-exported Next.js application served by Netlify's CDN. The backend is a Python FastAPI service deployed on Render. Supabase handles both the PostgreSQL database and authentication token management.

```
┌──────────────────────┐      HTTPS / REST       ┌─────────────────────┐
│   Next.js 14 (SSG)   │ ──────────────────────► │  FastAPI (Python)   │
│   Netlify CDN        │ ◄────────────────────── │  Render Web Service │
└──────────────────────┘      JSON + JWT          └──────────┬──────────┘
                                                             │ supabase-py
                                                   ┌─────────▼──────────┐
                                                   │  Supabase           │
                                                   │  PostgreSQL + Auth  │
                                                   └────────────────────┘
```

| Layer | Technology | Hosting | Responsibility |
|---|---|---|---|
| Frontend | Next.js 14 (App Router) | Netlify | UI, routing, SSR/SSG, API calls |
| Backend | FastAPI (Python 3.12) | Render (Web Service) | Business logic, streak engine, REST API |
| Database | PostgreSQL via Supabase | Supabase (managed) | Persistent data storage |
| Auth | Supabase Auth (JWT) | Supabase | User sessions, row-level security |
| Storage | Supabase Storage | Supabase | Future: journal attachments (v2) |

---

### 4.2 Data Models

#### 4.2.1 `profiles` (extends Supabase Auth users)

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, FK `auth.users` | Mirrors Supabase Auth user ID |
| `display_name` | TEXT | NOT NULL | User's chosen display name |
| `created_at` | TIMESTAMPTZ | default `now()` | Account creation timestamp |
| `is_demo` | BOOLEAN | default `false` | Flags demo/seed accounts |

---

#### 4.2.2 `journal_entries`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, `gen_random_uuid()` | Unique entry identifier |
| `user_id` | UUID | FK `profiles.id`, NOT NULL | Owning user reference |
| `entry_date` | DATE | NOT NULL | Calendar date of entry |
| `title` | TEXT | NULLABLE | Optional entry title |
| `body` | TEXT | NOT NULL | Full journal text (markdown) |
| `created_at` | TIMESTAMPTZ | default `now()` | Wall-clock creation time |
| `updated_at` | TIMESTAMPTZ | default `now()` | Last edit timestamp (trigger-updated) |
| `deleted_at` | TIMESTAMPTZ | NULLABLE | Soft-delete timestamp |

> **Index:** `(user_id, entry_date DESC)` for fast list queries. **RLS Policy:** `USING (user_id = auth.uid())`

---

#### 4.2.3 `habits`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, `gen_random_uuid()` | Unique habit identifier |
| `user_id` | UUID | FK `profiles.id`, NOT NULL | Owning user reference |
| `name` | TEXT | NOT NULL | Short label e.g. "Read 20 pages" |
| `description` | TEXT | NULLABLE | Optional longer description |
| `emoticon` | TEXT | NULLABLE | Emoticon shortcode for UI display |
| `color` | TEXT | NULLABLE | Hex colour for habit chip |
| `frequency` | TEXT | NOT NULL, default `'daily'` | `daily` \| `weekdays` \| `custom` |
| `created_at` | TIMESTAMPTZ | default `now()` | Habit creation timestamp |
| `archived_at` | TIMESTAMPTZ | NULLABLE | Soft-archive timestamp |

---

#### 4.2.4 `habit_completions`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, `gen_random_uuid()` | Unique completion record |
| `habit_id` | UUID | FK `habits.id`, NOT NULL | Which habit was completed |
| `user_id` | UUID | FK `profiles.id`, NOT NULL | Redundant FK for RLS performance |
| `completion_date` | DATE | NOT NULL | Date the habit was completed |
| `completed_at` | TIMESTAMPTZ | default `now()` | Exact wall-clock time of check-in |
| `note` | TEXT | NULLABLE | Optional brief note on this completion |
| UNIQUE | `(habit_id, completion_date)` | Constraint | One completion per habit per day |

> **Index:** `(user_id, completion_date DESC)` · **RLS Policy:** `USING (user_id = auth.uid())`

---

### 4.3 API Design (FastAPI)

All endpoints live under `/api/v1/`. Every request requires `Authorization: Bearer <supabase_jwt>`. The backend verifies the JWT, extracts `user_id`, and applies it to all queries.

#### Journal Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/journal/entries` | List all entries, paginated, sorted `entry_date DESC` |
| `POST` | `/journal/entries` | Create a new journal entry |
| `GET` | `/journal/entries/{id}` | Fetch a single entry by ID |
| `PATCH` | `/journal/entries/{id}` | Update entry title/body |
| `DELETE` | `/journal/entries/{id}` | Soft-delete (sets `deleted_at`) |

#### Habit Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/habits` | List all active (non-archived) habits |
| `POST` | `/habits` | Create a new habit |
| `PATCH` | `/habits/{id}` | Update habit name / emoticon / color |
| `DELETE` | `/habits/{id}` | Archive habit (sets `archived_at`) |

#### Completion & Streak Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/completions?date=YYYY-MM-DD` | All completions for a given date |
| `POST` | `/completions` | Mark a habit complete for a date |
| `DELETE` | `/completions/{id}` | Un-mark a habit completion |
| `GET` | `/habits/{id}/streak` | Current & longest streak for one habit |
| `GET` | `/streaks/all` | Bulk streak data for all habits (< 300ms) |
| `GET` | `/history?from=&to=` | Aggregated history: entries + completions by date range |

#### Utility

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | `{ status: "ok", version: "1.0.0" }` — used by Render health checks |

---

### 4.4 Streak Engine Logic

The streak calculation is a **backend service** (`streak_service.py`) computed on demand from the `habit_completions` table. It is **not persisted** — freshness is guaranteed. A 1-minute in-memory TTL cache per `(user_id, habit_id)` can be layered in if needed.

#### Algorithm — Current Streak

```
1. Fetch all completion_dates for the habit, sorted DESC.
2. Start from TODAY. If no completion exists for today, start from YESTERDAY
   (grace period: prevents breaking active streaks for users who haven't
   opened the app yet today).
3. Walk backwards day-by-day.
4. For each day: if a completion record exists → increment counter.
5. On first gap → stop.
6. Return counter as current_streak.
```

#### Algorithm — Longest Streak

```
1. Fetch all completion_dates, sorted ASC.
2. Iterate: track running_streak and max_streak.
3. If gap > 1 day between consecutive dates → reset running_streak to 1.
4. Update max_streak = max(max_streak, running_streak).
5. Return max_streak as longest_streak.
```

#### Response Schema

```json
{
  "habit_id": "uuid",
  "habit_name": "Morning Meditation",
  "current_streak": 7,
  "longest_streak": 14,
  "last_completed_date": "2025-03-11",
  "total_completions": 52
}
```

---

## 5. Feature Requirements ♡(◕‿◕)

### 5.1 Feature Priority Matrix

| ID | Feature | Description | Priority | Effort |
|---|---|---|---|---|
| F-01 | Auth & Onboarding | Email/password sign-up and sign-in via Supabase Auth. JWT sessions. Protected routes in Next.js. | P0 — Critical | M |
| F-02 | Journal Engine | Create, view, edit, and soft-delete entries. Each entry has a date, optional title, and markdown body with auto-save. | P0 — Critical | M |
| F-03 | Habit CRUD | Create habits with name, emoticon, color, and description. Edit and archive habits. | P0 — Critical | S |
| F-04 | Daily Checklist | View today's habits as a checklist. Tap to toggle complete/incomplete. Visual feedback. | P0 — Critical | S |
| F-05 | Streak Engine | FastAPI service computing current & longest streak per habit. Bulk `/streaks/all` endpoint. | P0 — Critical | M |
| F-06 | History / Calendar | 90-day calendar view. Click a day → journal entry + habits completed that day. | P1 — High | L |
| F-07 | Demo User Seed | Python seed script: 14 days of AI-generated journal entries + habit completions for demo user. | P1 — High | S |
| F-08 | Habit Stats Card | Per-habit stats: current streak, longest streak, total completions, 7-day sparkline. | P1 — High | M |
| F-09 | Dashboard Overview | Post-login landing: today's date, journal prompt, today's checklist, streak highlights. | P1 — High | M |
| F-10 | Responsive Design | Mobile-usable layout (375px min). Hamburger nav. Journal + checklist functional on small screens. | P2 — Medium | M |
| F-11 | Profile Settings | Update display name, change password, delete account (GDPR cascade delete). | P2 — Medium | S |
| F-12 | Completion Notes | Optional short note when completing a habit (e.g. "Did 25 mins of Headspace"). | P3 — Low | S |

---

### 5.2 Feature Detail: Journaling Engine (F-02)

#### User Stories

- (◕‿◕) As a user, I can click "New Entry" and start writing immediately, pre-filled with today's date.
- (◕‿◕) As a user, I can edit any past entry to correct mistakes or add reflections.
- (◕‿◕) As a user, I can see when each entry was last updated.
- (◕‿◕) As a user, I can delete an entry so it no longer appears in my history.

#### Acceptance Criteria

- Editor supports markdown rendering (bold, italics, headings, lists) via `react-md-editor` or `@uiw/react-textarea-code-editor`
- Entry body supports minimum 10,000 characters
- Auto-save fires every 30 seconds with a visual indicator ("Saving..." / "Saved ✓")
- Entry list is sorted by `entry_date DESC`, paginated (20 per page)
- Each list item shows: date, title (or first 80 chars of body), last updated timestamp
- Create/edit/delete actions produce toast notifications ("Entry saved (^‿^)", "Entry deleted")
- Deleted entries return 404 on direct URL access

---

### 5.3 Feature Detail: Streak Engine (F-05)

#### User Stories

- (ง•̀_•́)ง As a user, I can see my current streak for each habit to feel motivated to maintain it.
- (ง•̀_•́)ง As a user, I can see my longest-ever streak per habit to have a personal record to beat.

#### Acceptance Criteria

- Streak is computed at request time (not stored), based on `completion_date` records
- Grace period: if today has no completion, streak is measured from yesterday
- `GET /streaks/all` returns streak objects for all active habits in < 300ms for up to 20 habits
- Unit tests cover: 0-day streak, 1-day streak, gap recovery, longest streak across multiple runs
- Streak displayed in UI with a live badge: `(ﾉ◕ヮ◕)ﾉ  7 days`

---

### 5.4 Feature Detail: History / Calendar View (F-06)

#### User Stories

- ✿ As a user, I can open a calendar and click any past date to see what I wrote and which habits I completed.
- ✿ As a user, I can see at a glance which days had journal entries and my habit completion rate.

#### Acceptance Criteria

- Calendar renders a 90-day rolling window; user can navigate month-by-month
- Each day cell shows a **green fill gradient** proportional to % of habits completed (0% = beige `#F5F0E8`, 100% = sage `#6B8E6B`)
- A small emoticon dot `✿` marks days with journal entries
- Clicking a day opens a side panel showing: full journal entry (if any) + list of completed habits with check marks
- Days with zero activity remain in default warm cream

---

## 6. UI / UX Design Specifications (✿◠‿◠)

### 6.1 Design Language

DayBloom uses a **"Maximalistic Warmth"** design language. Unlike the current trend of sterile minimalism, DayBloom embraces richness: layered backgrounds, generous use of decorative **emoticons** (ASCII-art style: `(^._.^)~`, `✿`, `(◕‿◕)`, `♡`, `✧`, `(ﾉ◕ヮ◕)ﾉ` — not standard Unicode emoji), lush mixed typography, and a warm beige-and-earth-toned palette.

---

### 6.2 Colour Palette

| Role | Name | Hex | Usage |
|---|---|---|---|
| Background | Warm Cream | `#F5F0E8` | Page background, main surfaces |
| Surface | Linen | `#FAF7F2` | Card backgrounds, input fields |
| Surface Alt | Bisque | `#EDE8DF` | Hover states, table alternates |
| Primary | Warm Umber | `#8B7355` | Headings, CTA buttons, icons |
| Secondary | Sage | `#6B8E6B` | Streak success, completion badges |
| Accent | Dusty Mauve | `#8E6B8B` | Tags, secondary badges, highlights |
| Text | Charcoal | `#2C2C2C` | Body text |
| Border | Tan | `#D4C5A9` | Dividers, card borders |
| Error | Muted Rose | `#C4706A` | Error states, delete actions |

### 6.3 Typography

| Role | Font | Size | Weight |
|---|---|---|---|
| Display / Hero | Georgia (serif) | 48–80px | Bold |
| H1 Section Headings | Georgia (serif) | 28–36px | Bold |
| H2 Sub-headings | Inter / Arial | 20–24px | Bold |
| Body text | Inter / Arial | 14–16px | Regular, line-height 1.7 |
| Labels / Captions | Inter / Arial | 12–13px | Regular, 70% opacity |
| Emoticons in headings | Same as heading | Same size | — |

### 6.4 Component Inventory

| Component | Description |
|---|---|
| `<HabitChip />` | Coloured pill with emoticon, habit name, and streak badge |
| `<StreakBadge />` | `(ﾉ◕ヮ◕)ﾉ` with streak count, colour-coded by milestone |
| `<JournalCard />` | Entry preview card: date, title, body excerpt, edit button |
| `<CalendarGrid />` | 7-column month grid, colour-coded day cells |
| `<DayDetailPanel />` | Slide-in panel for selected calendar day |
| `<ChecklistItem />` | Animated check-off with satisfaction micro-animation |
| `<EmptyState />` | Illustrated emoticon state for zero-data views |
| `<ToastNotification />` | Top-right toast with emoticon prefix |
| `<StatsCard />` | Habit stats with recharts sparkline |
| `<MarkdownEditor />` | Journal write/edit surface (react-md-editor) |

### 6.5 Page Map & Navigation

| Route | Page | Key Content |
|---|---|---|
| `/` | Landing / Login | Hero copy, auth form, demo login CTA |
| `/dashboard` | Dashboard | Today's date + prompt, today's checklist, streak highlights |
| `/journal` | Journal List | Paginated entries sorted by date |
| `/journal/new` | New Entry | Full-page markdown editor |
| `/journal/[id]` | Entry Detail / Edit | Read view + inline edit mode |
| `/habits` | Habit Manager | Grid of habit cards with CRUD actions |
| `/habits/[id]` | Habit Detail | Streak chart, full completion history for one habit |
| `/history` | History / Calendar | Calendar grid + day-detail side panel |
| `/settings` | Profile Settings | Display name, password, account deletion |

### 6.6 Interaction Design Notes

- **Checklist check-off:** Tapping a habit item triggers a satisfying pop animation — the emoticon briefly enlarges (scale 1.0 → 1.3 → 1.0) and the row slides into a "done" state with sage green background.
- **Journal auto-save:** A subtle pulsing `...` indicator replaces the save button during save; changes to `✓ Saved` on success.
- **Empty states:** Every zero-data view shows a warm emoticon illustration with encouraging copy. Example for no habits: `(˘▾˘) No habits yet! Add your first one below ✿`
- **Demo login CTA:** Pre-fills the form with demo credentials and shows a `(^._.^)~ Try as Luna Bloom` button on the landing page.
- **Cold start message:** On first API call if Render service is sleeping, the UI shows `(～￣▽￣)～ Waking up the server... just a moment!` instead of a blank loader.

---

## 7. Demo User & Seed Data ✧٩(◕‿◕)۶✧

A pre-seeded demo user is a **first-class deliverable**. It allows reviewers, investors, and new users to immediately experience the full value proposition without signing up or manually entering data.

### 7.1 Demo User Profile

| Field | Value |
|---|---|
| Display Name | Luna Bloom ✿ |
| Email | `demo@daybloom.app` |
| Password | `DayBloom2025!` |
| Account type | `is_demo = true` (prevents accidental deletion) |
| Seed period | 14 consecutive days ending on the day before the seed script runs |

### 7.2 Seed Habits (7 habits)

| Habit Name | Emoticon | Frequency | 14-day Completion Pattern |
|---|---|---|---|
| Morning meditation | `✿(◠‿◠)` | Daily | **14/14** — perfect streak |
| Read 20 pages | `(◕‿◕)` | Daily | **12/14** — 2 missed (days 4, 9) |
| Drink 8 glasses of water | `(ﾉ◕ヮ◕)ﾉ` | Daily | **10/14** — 4 missed (weekends) |
| 30 min walk | `v(^_^)v` | Daily | **11/14** — 3 missed |
| Gratitude journaling | `♡(˘▾˘)` | Daily | **13/14** — 1 missed (day 7) |
| No phone 1hr before bed | `(￣ω￣)` | Daily | **8/14** — demonstrates gap/recovery |
| Learn something new | `✧(^‿^)✧` | Weekdays only | **9/10** weekdays — 1 missed |

> This pattern is **deterministic and hardcoded** in the seed script (not random), so results are reproducible every run.

### 7.3 AI-Generated Journal Entries

14 journal entries are generated using the **Anthropic API** (`claude-haiku-3-5`) with a persona-specific prompt. The prompt instructs the model to write in Luna Bloom's warm, reflective first-person voice — mixing gratitude, daily observations, habit reflections, and personal goals. Entries range from 150–400 words.

**Sample prompt template:**

```
You are Luna Bloom, a warm and introspective person who journals daily.
Write a personal journal entry for {date}. Today you completed these habits:
{completed_habits}. You missed: {missed_habits}. Write 150-300 words in a
reflective, grateful, and honest tone. Mention 1-2 specific habits naturally.
Do not use generic phrases. Make it feel genuinely personal.
```

### 7.4 Seed Script Architecture (`scripts/seed_demo.py`)

```
① Create Supabase Auth user (demo@daybloom.app)
② Insert profiles row with is_demo = true
③ Insert 7 habits with emoticons, colours, and descriptions
④ For each of 14 days (today-14 → today-1):
    ├── Call Anthropic API to generate journal entry for that date
    ├── INSERT into journal_entries
    ├── Apply deterministic completion pattern per habit
    └── INSERT habit_completion rows for each completed habit
⑤ Print summary table: habit name | completions | current streak | longest streak
⑥ Script is idempotent: running again deletes and re-seeds (safe for CI)
```

**Required environment variables:**

```bash
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJh...       # Service role key — bypasses RLS
ANTHROPIC_API_KEY=sk-ant-...
```

**Run command:**

```bash
pip install supabase anthropic python-dotenv
python scripts/seed_demo.py
```

---

## 8. Deployment & Infrastructure (ง•̀_•́)ง

### 8.1 Frontend — Netlify

| Setting | Value |
|---|---|
| Framework | Next.js 14, App Router |
| Build command | `npm run build` |
| Publish directory | `.next` (or `out` for static export) |
| Node version | 20.x |
| Branch deploys | `main` → production · `develop` → preview |
| Environment vars | `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` |

### 8.2 Backend — Render

| Setting | Value |
|---|---|
| Service type | Web Service (free tier) |
| Runtime | Python 3.12 |
| Start command | `uvicorn main:app --host 0.0.0.0 --port $PORT` |
| Health check | `GET /health` |
| Environment vars | `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `JWT_SECRET`, `ALLOWED_ORIGINS` |
| Cold start note | Free tier sleeps after 15 min inactivity — frontend shows warm wake-up message |

### 8.3 Database — Supabase

| Setting | Value |
|---|---|
| PostgreSQL | v15 on Supabase free tier |
| RLS | Enabled on all tables |
| RLS policy pattern | `USING (user_id = auth.uid())` on all SELECT/INSERT/UPDATE/DELETE |
| Migrations | Managed via Supabase CLI (`supabase/migrations/*.sql`) |
| Backups | Supabase free tier: daily PITR, 7-day retention |

### 8.4 CI/CD Flow

```
git push origin main
        │
        ├──► Netlify auto-deploys frontend
        │
        └──► Render auto-deploys backend (if Render GitHub integration is configured)

Seed script is run manually post-deploy:
  python scripts/seed_demo.py
```

---

## 9. Development Timeline ✿(^‿^)✿

> Estimated for a single full-stack developer or a two-person frontend/backend split.

| Phase | Milestone | Duration | Key Deliverables |
|---|---|---|---|
| Phase 0 | Setup & Scaffolding | 3 days | Repo setup, Supabase project, Next.js + FastAPI boilerplate, CI/CD pipelines |
| Phase 1 | Auth & Profiles | 2 days | Sign-up/sign-in pages, protected routes, JWT middleware, RLS policies |
| Phase 2 | Journal Engine | 4 days | CRUD API + frontend pages, markdown editor, auto-save, entry list pagination |
| Phase 3 | Habit Management | 3 days | Habit CRUD API + `/habits` page, habit chips UI, archive flow |
| Phase 4 | Daily Checklist | 2 days | Daily checklist on `/dashboard`, toggle complete API, optimistic UI |
| Phase 5 | Streak Engine | 3 days | `streak_service.py`, `/streaks/all` endpoint, streak badges in UI, unit tests |
| Phase 6 | History / Calendar | 4 days | Calendar grid component, day-detail panel, `/history` page, aggregation endpoint |
| Phase 7 | Demo Seed Script | 2 days | `seed_demo.py`, AI journal generation, idempotent seeding, README docs |
| Phase 8 | Design Polish | 4 days | Full colour palette, emoticons, typography, micro-animations, empty states, toasts |
| Phase 9 | QA & Launch | 3 days | Cross-browser QA, mobile layout, Lighthouse audit, production deploy, seed demo user |
| **Total** | | **30 working days** | **~6 weeks solo / ~3–4 weeks with two engineers** |

---

## 10. Security & Privacy (￣ω￣)

### 10.1 Authentication & Authorisation

- ◉ All API endpoints require a valid Supabase JWT in `Authorization: Bearer <token>`
- ◉ Backend validates JWT signature using the Supabase JWT secret (HS256)
- ◉ **Row Level Security (RLS)** enforces `user_id` isolation at the database layer — even a compromised API key cannot read another user's data without the correct `auth.uid()`
- ◉ Passwords handled entirely by Supabase Auth (bcrypt hashing — never stored in custom tables)
- ◉ `is_demo` flag prevents accidental deletion of seed data via the normal delete flow

### 10.2 Data Privacy

- ◉ Journal entries and habit data are private by design — no sharing features in v1
- ◉ Demo user data is clearly marked and can be wiped on demand via `seed_demo.py --reset`
- ◉ **GDPR:** "Delete account" flow hard-deletes all user data including journal entries and completions (cascade delete via FK constraints on `profiles.id`)
- ◉ No client-side analytics cookies; use Netlify server-side analytics if tracking is needed

---

## 11. Testing Strategy ✿(◠‿◠)

### 11.1 Backend Testing (pytest)

- Unit tests for `streak_service.py` — cover all edge cases:
  - 0-day streak (no completions ever)
  - 1-day streak (completed only today)
  - Gap recovery (missed 1 day, current streak resets)
  - Longest streak across multiple runs
  - Grace period (no completion today, streak measures from yesterday)
- Integration tests: FastAPI `TestClient` for all endpoints with Supabase test project
- **Coverage target:** > 80% for streak service, > 60% overall

### 11.2 Frontend Testing

- **Component tests:** React Testing Library for `<ChecklistItem />`, `<CalendarGrid />`, `<JournalCard />`
- **E2E tests (Playwright):** Critical user flows:
  1. Sign up → create habit → check off → view streak
  2. Write journal entry → view in history calendar
  3. Demo login → browse pre-seeded data

### 11.3 Performance Benchmarks

| Metric | Target |
|---|---|
| Lighthouse Performance (desktop) | > 90 |
| Lighthouse Accessibility | > 95 |
| API response time (general) | < 200ms |
| `/streaks/all` (20 habits) | < 300ms |
| LCP (Largest Contentful Paint) | < 1.5s |

---

## 12. Open Questions & Decisions (°_°)

| # | Question | Proposed Answer / Owner |
|---|---|---|
| 1 | Should the streak grace period be 1 day or same-day only? | **Proposed:** 1-day grace (prevents anxiety). Owner: PM to confirm. |
| 2 | Is markdown rendering in journal entries required in v1? | **Proposed:** Yes — adds significant perceived value at low cost. |
| 3 | Should habit completion be toggleable after midnight (back-filling)? | **Proposed:** Allow up to 48 hours back-fill. Restrict further to avoid gaming. |
| 4 | What happens to habit streaks when a habit is archived? | **Proposed:** Streak frozen at archive date. Unarchiving resumes from frozen value. |
| 5 | Do we need a mobile app for v1? | **Proposed:** Responsive web only. Native app is v2. |
| 6 | Should demo login be one click or require credentials? | **Proposed:** Pre-fill form + `(^._.^)~ Try as Luna Bloom` button. |
| 7 | Should the seed script use `claude-haiku-3-5` or `claude-sonnet-4` for journal generation? | **Proposed:** `claude-haiku-3-5` for speed and cost. Sonnet optional for higher quality. |

---

## 13. Appendix ♡(˘▾˘)

### 13.1 Glossary

| Term | Definition |
|---|---|
| **Current Streak** | Number of consecutive days (up to today or yesterday) a habit was completed without a break |
| **Longest Streak** | Historical maximum of consecutive completed days for a habit |
| **Completion Date** | A `DATE` value (no time) representing the calendar day a habit was marked done |
| **Demo User** | Pre-seeded account (`is_demo = true`) with 14 days of AI-generated data |
| **Soft Delete** | Setting `deleted_at` instead of removing a row — allows recovery |
| **Grace Period** | 1-day streak allowance: if today has no completion, streak is measured from yesterday |
| **RLS** | Row-Level Security — Supabase/PostgreSQL feature enforcing per-user data isolation |
| **Emoticon** | ASCII-art sequences like `(◕‿◕)`, `✿`, `♡` used as decorative UI elements — distinct from Unicode emoji |

### 13.2 Tech Stack Reference

| Technology | Docs | Notes |
|---|---|---|
| Next.js 14 | https://nextjs.org/docs | App Router, SSG, protected routes |
| FastAPI | https://fastapi.tiangolo.com | Python async REST, auto OpenAPI docs at `/docs` |
| Supabase | https://supabase.com/docs | PostgreSQL + Auth + RLS + Storage |
| Netlify | https://docs.netlify.com | Git-based CI/CD, CDN, server-side analytics |
| Render | https://render.com/docs | Simple PaaS for Python web services |
| react-md-editor | https://uiwjs.github.io/react-md-editor | Markdown editor for journal entries |
| recharts | https://recharts.org | Composable charts (sparklines, streak history) |
| Playwright | https://playwright.dev | E2E test framework |
| pytest | https://docs.pytest.org | Python test framework for FastAPI backend |
| Anthropic API | https://docs.anthropic.com | Used by seed script for AI journal generation |

### 13.3 Revision History

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | March 2025 | Product Team | Initial PRD — full v1.0 scope defined |

---

*✿ (◕‿◕) ✿  DayBloom — Bloom, one day at a time  ✿ (◕‿◕) ✿*

*End of Product Requirements Document*
