# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev              # start dev server (webpack bundler)
npm run build            # production build
npm run lint             # ESLint check
npm run seed:categories  # seed categories/subcategories from data/*.csv into Supabase
```

No test runner is configured.

## What this app is

**tulocal** is a local commerce directory for Catamarca, Argentina. It connects local vendors (shops) with customers through a browsable catalog, map view, and vendor dashboard.

## Tech stack

- **Next.js 16** (App Router, Server Actions, React 19) — read `node_modules/next/dist/docs/` before touching routing or data-fetching APIs
- **Supabase** — PostgreSQL + Auth + Storage (no ORM; raw Supabase SDK queries)
- **Tailwind CSS 4** + **shadcn/ui** (Base UI) for styling
- **React Hook Form** + **Zod** for forms and validation schemas
- **Resend** + **React Email** for transactional email (`lib/mail-service.ts`)
- **Leaflet** / **React Leaflet** for the map view

## Route structure

```
app/
  page.tsx                    # Home: hero carousel + shop listing
  [slug]/                     # Public shop detail page
  mapa/                       # Leaflet map of shops
  contacto/                   # Contact form → Resend email
  login/                      # Auth (sign-in / sign-up tabs)
  auth/callback/              # Supabase OAuth callback
  auth/forgot-password/
  auth/update-password/
  dashboard/                  # Protected vendor area
    nuevo/                    # Create shop
    catalogo/[id]/editar/     # Edit listing
    ubicacion/                # Shop location
  admin/                      # Admin-only panel
  api/resend/webhook/         # Resend email webhook (Node runtime, Svix sig verification)
```

## Data layer

- **Server Components** fetch data directly via the Supabase server client (`utils/supabase/server.ts`).
- **Server Actions** (`"use server"`) handle all mutations — auth, shop CRUD, listing management, lead capture.
- **`utils/supabase/public.ts`** — a sessionless client used in statically cached pages.
- **`utils/supabase/middleware.ts`** — session refresh + auth redirects on every request.
- Database types are auto-generated in `lib/database.types.ts`.
- SQL migrations live in `supabase/sql/`.

## Auth

Supabase Auth (email/password + Google OAuth). All auth Server Actions are in `app/auth/actions.ts`. Middleware redirects unauthenticated users away from `/dashboard` and `/admin`, and redirects authenticated users away from `/login`. Admin access is gated by `isAdminUser()` in `lib/auth-admin.ts`.

## Key lib files

| File | Purpose |
|------|---------|
| `lib/database.types.ts` | Generated Supabase types |
| `lib/auth-schemas.ts` | Zod schemas for auth forms |
| `lib/auth-admin.ts` | Admin role guard |
| `lib/mail-service.ts` | Resend email helpers |
| `lib/shop-taxonomy.ts` | Category/subcategory helpers |
| `lib/shop-flyers.ts` | Plan-dependent flyer limits |
| `lib/theme-cookie.ts` | Cookie-based light/dark theme |

## Environment variables

See `.env.example`. Critical ones:
- `RESEND_API_KEY` — transactional email
- `RESEND_WEBHOOK_SECRET` — Svix webhook verification
- Supabase URL + anon key (set in `.env.local`, not committed)
