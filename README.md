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
  - `/dashboard/recruit` — **EVO-Recruit** (ATS). Fully real: candidates/clients/requisitions CRUD (with CSV import/export), resume pool + AI resume screening, digital offer letters, background check tracking, onboarding, and offboarding, plus live overview stats and analytics. Only "candidate portal" and "rehire & alumni pool" remain `FeatureTile` placeholders.
  - `/dashboard/people` — **EVO-People Management** (HR core). Placeholder tiles only — no backend yet.
  - `/dashboard/talent` — **EVO-Talent Management**. Placeholder tiles only.
  - `/dashboard/payroll-benefits` — **EVO-Payroll & Benefits**. One real tile (links to `/dashboard/payroll`, the existing payroll-runs CRUD); benefits are placeholders.
  - `/dashboard/it-assets` — **EVO-IT & Asset Management**. Placeholder tiles only — no backend yet.

  `/dashboard/candidates`, `/dashboard/clients`, `/dashboard/requisitions`, `/dashboard/resume-pool`, `/dashboard/offer-letters`, `/dashboard/background-checks`, `/dashboard/onboarding`, `/dashboard/offboarding`, `/dashboard/payroll`, and `/dashboard/analytics` are still real, separately-routed pages — they're just reached through the EVO-Recruit / EVO-Payroll & Benefits module pages now. Log in as `demo` (see the backend README) to see a desk pre-populated with sample data, or sign up for a fresh, empty one.

  **Onboarding and Offboarding** each follow a list → detail drill-down: the list page shows every candidate's onboarding/offboarding as a progress card; clicking one opens a per-category task checklist (6 categories for onboarding — pre-joining documents, orientation, training plan, portal access, probation evaluation, device assignment; 3 for offboarding — documents checklist, access status, hardware clearance). Clicking a task's status pill cycles it Pending → In Progress → Done; the parent record's `progress` is computed server-side from that.

  **CSV import/export** (`Clients` and `Candidates` pages, via `src/components/dashboard/CsvToolbar.tsx`) is a three-step wizard: upload a file, confirm/adjust the column→field mapping (pre-filled with the backend's best-guess mapping), then commit — showing a created count plus a per-row error list for anything that failed validation (e.g. a missing required field). Export streams the user's own rows as a CSV download via `src/lib/auth-api.ts::downloadFile` (a plain `<a href>` can't carry the auth header, so it fetches the blob and triggers the save manually).

  **The sidebar is per-module, not global.** `/dashboard` (the hub) and `/dashboard/settings` render with no sidebar at all — `src/lib/dashboard-modules.ts` is the single source of truth for which sub-pages belong to which module (`findActiveModule(pathname)`), and `Sidebar` returns `null` when the current route isn't inside any module. `DashboardShell` uses the same lookup to hide the mobile hamburger button when there's no sidebar to open. The Topbar's search bar is scoped the same way — each module has its own `searchPlaceholder`, and the search bar itself disappears outside a module (there's no cross-module search; they're separate apps with separate data).

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
- `src/lib/payroll-benefits-api.ts` — EVO-Payroll & Benefits' typed client (payroll-runs CRUD), hitting `/payroll-benefits/...`. People/Talent/IT-Assets have no API client yet — there's no backend for them.
- `src/lib/dashboard-modules.ts` — the module-nav registry (`dashboardModules`, `findActiveModule`) shared by `Sidebar`, `DashboardShell`, and `Topbar`
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
