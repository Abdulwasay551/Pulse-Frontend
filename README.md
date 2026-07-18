# EvoHR Frontend

Next.js marketing site for **EvoHR** — a recruitment CRM & ATS for staffing agencies, in the vein of RecruitCRM. All page content is fetched from the headless [EvoHR backend](https://github.com/Abdulwasay551/EvoHr-Backend) (Wagtail CMS) rather than hardcoded.

## Stack

- Next.js 16 (App Router, Turbopack)
- TypeScript
- Tailwind CSS v4
- pnpm

## Pages

`/`, `/pricing`, `/solutions`, `/use-cases`, `/who-we-serve`, `/resources` — mirroring the top nav. Each is an async Server Component that fetches its content from the CMS API via `src/lib/cms.ts`.

## Getting started

```bash
pnpm install
cp .env.example .env.local   # point CMS_API_URL at your running backend
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The [EvoHR backend](https://github.com/Abdulwasay551/EvoHr-Backend) must be running for pages to render (they fetch content server-side at request/build time).

## Environment variables

See `.env.example`:

- `CMS_API_URL` — base URL of the backend's headless API (defaults to `http://localhost:8000/api/cms/v2`)

## Project structure

- `src/app/` — routes (one folder per public page)
- `src/components/site/` — shared marketing components (`Navbar`, `Hero`, `HeroDashboard`, `Footer`, `PricingTiers`, `widgets.tsx`, ...)
- `src/lib/cms.ts` — typed fetch helpers for the Wagtail headless API

## Scripts

```bash
pnpm dev      # start the dev server
pnpm build    # production build
pnpm lint     # eslint
```
