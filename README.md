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
  - `/dashboard/recruit` — **EVO-Recruit** (ATS). Fully real: candidates/clients/requisitions CRUD, live overview stats, analytics. The rest of its feature list (offer letters/e-sign, candidate portal, background checks, AI scoring, onboarding/offboarding/rehire) are `FeatureTile` placeholders for now.
  - `/dashboard/people` — **EVO-People Management** (HR core). Placeholder tiles only — no backend yet.
  - `/dashboard/talent` — **EVO-Talent Management**. Placeholder tiles only.
  - `/dashboard/payroll-benefits` — **EVO-Payroll & Benefits**. One real tile (links to `/dashboard/payroll`, the existing payroll-runs CRUD); benefits are placeholders.
  - `/dashboard/it-assets` — **EVO-IT & Asset Management**. Placeholder tiles only — no backend yet.

  `/dashboard/candidates`, `/dashboard/clients`, `/dashboard/requisitions`, `/dashboard/payroll`, and `/dashboard/analytics` are still real, separately-routed pages — they're just reached through the EVO-Recruit / EVO-Payroll & Benefits module pages instead of a flat top-level sidebar now. The `Sidebar` highlights a module's nav item while viewing one of its sub-pages via `extraPaths`. Log in as `demo` (see the backend README) to see a desk pre-populated with sample data, or sign up for a fresh, empty one.

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
- `src/lib/auth-api.ts` — typed client-side fetch helpers for the auth/demo-request API (`credentials: "include"` for the refresh cookie); exports the shared `apiFetch` helper `crm-api.ts` also uses
- `src/lib/auth-context.tsx` — `AuthProvider`/`useAuth()`: holds the in-memory access token + current user, does a silent refresh on mount, exposes `login`/`register`/`logout`/`withAuth` (auto-retries once on a 401 by refreshing)
- `src/lib/crm-api.ts` — typed client-side fetch helpers for the dashboard's CRM API (clients/requisitions/candidates/payroll CRUD + the dashboard-summary aggregate), every call taking an access token from `withAuth`
- `src/components/dashboard/Modal.tsx` — the shared create/edit-form overlay used by all four CRUD dashboard pages
- `src/components/dashboard/ModuleHeader.tsx`, `FeatureSection.tsx`, `FeatureTile.tsx` — the module-page building blocks: a header (icon/title/description + "All modules" back-link), a titled tile grid, and a tile that's either a real link or an unstyled-disabled "Coming soon" placeholder depending on whether `href` is passed

Every dashboard CRUD page follows the same shape: `useEffect` + `withAuth` to load on mount, a `Modal`-based form shared between create and edit, and a plain `window.confirm` before delete.

## Scripts

```bash
pnpm dev      # start the dev server
pnpm build    # production build
pnpm lint     # eslint
```
