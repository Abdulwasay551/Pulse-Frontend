# EvoHR Frontend

Next.js marketing site for **EvoHR** — a recruitment CRM & ATS for staffing agencies, in the vein of RecruitCRM. All page content is fetched from the headless [EvoHR backend](https://github.com/Abdulwasay551/EvoHr-Backend) (Wagtail CMS) rather than hardcoded.

## Stack

- Next.js 16 (App Router, Turbopack)
- TypeScript
- Tailwind CSS v4
- pnpm

## Pages

Two route groups, each with its own root layout:

- **`(marketing)`** — `/`, `/pricing`, `/solutions`, `/use-cases`, `/who-we-serve`, `/resources`, `/book-a-demo`, `/privacy`, `/terms`. Mostly async Server Components fetching content from the CMS API via `src/lib/cms.ts`; `/book-a-demo` is a client component form posting to the backend's `/api/demo-requests/`.
- **`(app)`** — `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/dashboard/*`. Real auth (JWT via `src/lib/auth-context.tsx`) gates everything under `/dashboard` (`AuthGuard`). `/dashboard` itself is a **module hub** (hero + cards) for the five modules the product is expanding into:
  - `/dashboard/recruit` — **EVO-Recruit** (ATS). **Fully real — every feature in the spec, no "coming soon" left.** Candidates/clients/requisitions CRUD (with CSV import/export), a resume pool, AI resume screening, digital offer letters, background check tracking, onboarding, offboarding, a candidate portal, and a rehire/alumni pool, plus live overview stats and analytics. Resume Pool (`/dashboard/resume-pool`, upload/replace/remove a file, edit resume text) and AI Resume Screening (`/dashboard/ai-resume-screening`, run/re-run scoring) are deliberately separate pages — the former is CRUD on the resume attachment itself, the latter is the scoring action against it. Candidate Portal (`/dashboard/candidate-portal`) is the recruiter-facing management view — copy/open each candidate's public status link, which resolves at `/portal/[token]` (a public, unauthenticated page under the `(marketing)` route group, since the candidate isn't a logged-in user of this app). Rehire & Alumni Pool (`/dashboard/rehire-pool`) filters offboarded candidates down to the `rehire_eligible` ones, with editable notes.
  - `/dashboard/people` — **EVO-People Management** (HR core). Employee Records is real: Employee Database (`/dashboard/employee-database`, full CRUD + CSV import/export + per-employee document upload) and Organizational Chart (`/dashboard/org-chart`, a tree view derived from each employee's manager). The hub itself has real stat cards (headcount/active/on-leave/departments) and department/status breakdowns, same visual pattern as Recruit's. Attendance Management, Employee Engagement, Employee Self-Service, and Workforce Dashboard remain "coming soon".
  - `/dashboard/talent` — **EVO-Talent Management**. Same — navigable, all "coming soon".
  - `/dashboard/payroll-benefits` — **EVO-Payroll & Benefits**. One real feature (Payroll runs, at `/dashboard/payroll`); the rest of Payroll and all of Benefits are "coming soon".
  - `/dashboard/it-assets` — **EVO-IT & Asset Management**. All "coming soon" — no backend yet.

  `/dashboard/candidates`, `/dashboard/clients`, `/dashboard/requisitions`, `/dashboard/resume-pool`, `/dashboard/offer-letters`, `/dashboard/background-checks`, `/dashboard/onboarding`, `/dashboard/offboarding`, `/dashboard/payroll`, and `/dashboard/analytics` are still real, separately-routed pages — they're just reached through the EVO-Recruit / EVO-Payroll & Benefits module pages now. Log in as `demo` (see the backend README) to see a desk pre-populated with sample data, or sign up for a fresh, empty one.

  **Onboarding and Offboarding** each follow a list → detail drill-down: the list page shows every candidate's onboarding/offboarding as a progress card; clicking one opens a per-category task checklist (6 categories for onboarding — Pre-Joining Documents, Orientation, Training Plan and Schedule, Portal Access and Installations, Probation Evaluation, Device Assignment; 3 for offboarding — Documents Checklist, Access Status, Hardware Clearance). Clicking a task's status pill cycles it Pending → In Progress → Done; the parent record's `progress` is computed server-side from that. Each of those 6/3 categories is *also* its own sidebar sub-sub-module — `/dashboard/onboarding?category=X` and `/dashboard/offboarding?category=X` render a **category cross-section**: every task in that one category, across every candidate's onboarding/offboarding, in one flat table (with its own "add task" flow) — not just a redirect to the same list page.

  **CSV import/export** (`Clients` and `Candidates` pages, via `src/components/dashboard/CsvToolbar.tsx`) is a three-step wizard: upload a file, confirm/adjust the column→field mapping (pre-filled with the backend's best-guess mapping), then commit — showing a created count plus a per-row error list for anything that failed validation (e.g. a missing required field). Export streams the user's own rows as a CSV download via `src/lib/auth-api.ts::downloadFile` (a plain `<a href>` can't carry the auth header, so it fetches the blob and triggers the save manually).

  **Every module's exact three-level hierarchy from the Evo HRIS spec — module (one dashboard) → sub-module (collapsible section) → sub-sub-module (a feature) — lives in one place: `src/lib/dashboard-modules.ts`, using the spec's exact wording for every name.** `Sidebar` renders each sub-module as a collapsible group: hovering it previews its sub-sub-modules temporarily; clicking pins it open/closed independently of hover (a sub-module with only one feature collapses to a flat link instead). When the rail is collapsed to icons, a sub-module renders as one icon whose hover/click reveals the same sub-sub-module list as a floating flyout, instead of flattening every feature into one long icon list. Every hub page renders the *same* data as collapsible tile sections via `src/components/dashboard/ModuleFeatureSections.tsx` (built on the now-interactive `FeatureSection`, which defaults open but can be collapsed) — so the sidebar and the hub page can never drift out of sync with each other. A feature is "real" if its entry has an `href`; otherwise `featureHref()` routes it to `/dashboard/coming-soon` with the feature/section/module name as query params, so **every single nav entry and tile is a real, clickable link** — nothing is a dead, unclickable placeholder anymore.

  **The Recruit dashboard** uses a two-column layout: stat cards span the full width up top, then a main column (Placements chart, and the sub-module tile sections below) sits beside a sticky right rail (Pipeline + candidate-source breakdown, and Recent Activity) that stays in view while the main column scrolls.

  **The sidebar is per-module, not global.** `/dashboard` (the hub) and `/dashboard/settings` render with no sidebar at all — `src/lib/dashboard-modules.ts` is the single source of truth for which sub-pages belong to which module (`findActiveModule(pathname)`), and `Sidebar` returns `null` when the current route isn't inside any module. `findActiveModuleForRoute(pathname, searchParams)` is the version to use anywhere a route might be `/dashboard/coming-soon` (Sidebar, DashboardShell, Topbar all use it) — that page isn't itself a feature of any module, so it resolves the active module from its own `?module=` query param instead, otherwise the sidebar/search bar would simply vanish on it. Some feature hrefs carry a query string too (the onboarding/offboarding category cross-sections) — `usePathname()` never includes it, so `hrefPathname()` strips it before comparing against a bare pathname for module/section containment, while exact active-link highlighting compares against the full current URL (pathname + search params) instead. `DashboardShell` uses the same active-module lookup to hide the mobile hamburger button when there's no sidebar to open. The Topbar's search bar is scoped the same way — each module has its own `searchPlaceholder`, and the search bar itself disappears outside a module (there's no cross-module search; they're separate apps with separate data).

## Getting started

```bash
pnpm install
cp .env.example .env.local   # point CMS_API_URL / NEXT_PUBLIC_API_URL at your running backend
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The [EvoHR backend](https://github.com/Abdulwasay551/EvoHr-Backend) must be running for pages to render (marketing content is fetched server-side at request time) and for login/signup/the demo form to work. For local auth to succeed cross-origin, the backend's `DJANGO_CORS_ALLOWED_ORIGINS` must include `http://localhost:3000`.

## Environment variables

See `.env.example`:

- `CMS_API_URL` — base URL of the backend's headless CMS API, used **server-side only** (defaults to `http://localhost:8000/api/cms/v2`)
- `NEXT_PUBLIC_API_URL` — base URL of the backend's auth/app API, used **client-side** (`"use client"` components calling `src/lib/auth-api.ts`) — needs the `NEXT_PUBLIC_` prefix so Next.js inlines it into the browser bundle (defaults to `http://localhost:8000/api`)

## Project structure

- `src/app/(marketing)/` — public marketing routes
- `src/app/(app)/` — auth routes + the dashboard shell
- `src/components/site/` — shared marketing components (`Navbar`, `Hero`, `HeroDashboard`, `Footer`, `PricingTiers`, `widgets.tsx`, `BackToHomeLink`, ...)
- `src/components/dashboard/` — dashboard chrome (`AuthGuard`, `Topbar`, `Sidebar`, `DashboardShell`)
- `src/lib/cms.ts` — typed server-side fetch helpers for the Wagtail headless API
- `src/lib/auth-api.ts` — typed client-side fetch helpers for the auth/demo-request API (`credentials: "include"` for the refresh cookie); exports the shared `apiFetch` helper `api-resource.ts` builds on
- `src/lib/auth-context.tsx` — `AuthProvider`/`useAuth()`: holds the in-memory access token + current user, does a silent refresh on mount, exposes `login`/`register`/`logout`/`withAuth` (auto-retries once on a 401 by refreshing)
- `src/lib/api-resource.ts` — the generic list/create/update/remove factory every module's API client is built from (pure plumbing, shared on purpose — the domain types/endpoints below it are deliberately kept separate per module); also exports `csvApi`, the matching factory for a resource's export/import-preview/import-commit endpoints
- `src/lib/recruit-api.ts` — EVO-Recruit's typed client: clients/requisitions/candidates CRUD + dashboard-summary, offer letters, background checks, onboarding/onboarding-tasks, offboarding/offboarding-tasks, `screenCandidate`, `uploadResume`, and `clientsCsv`/`candidatesCsv` (via `csvApi`) — hitting `/recruit/...`
- `src/lib/payroll-benefits-api.ts` — EVO-Payroll & Benefits' typed client (payroll-runs CRUD), hitting `/payroll-benefits/...`.
- `src/lib/people-api.ts` — EVO-People's typed client so far: employees CRUD + dashboard-summary, employee documents (upload/delete), `employeesCsv` — hitting `/people/...`. Talent/IT-Assets have no API client yet — there's no backend for them.
- `src/lib/dashboard-modules.ts` — the module-nav registry (`dashboardModules`, `findActiveModule`, `findActiveModuleForRoute`) shared by `Sidebar`, `DashboardShell`, and `Topbar`
- `src/components/dashboard/Modal.tsx` — the shared create/edit-form overlay used by all CRUD dashboard pages; pass `wide` for content that needs more than the default `max-w-md` (the CSV mapping table, offer letter forms)
- `src/components/dashboard/CsvToolbar.tsx` — Export/Import CSV buttons plus the column-mapping import wizard (upload → map → commit → results), built on a resource's `csvApi` instance
- `src/components/dashboard/ModuleHeader.tsx`, `FeatureSection.tsx`, `FeatureTile.tsx` — the module-page building blocks: a header (icon/title/description + "All modules" back-link), a titled tile grid, and a tile that's either a real link or an unstyled-disabled "Coming soon" placeholder depending on whether `href` is passed

Every dashboard CRUD page follows the same shape: `useEffect` + `withAuth` to load on mount, a `Modal`-based form shared between create and edit, and a plain `window.confirm` before delete.

## Scripts

```bash
pnpm dev      # start the dev server
pnpm build    # production build
pnpm lint     # eslint
```
