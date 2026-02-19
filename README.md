# Hebrew RTL Sports Store MVP

Monorepo sports e-commerce project inspired by local sports stores, with original Hebrew content and full RTL support.

## Stack
- pnpm workspaces
- Next.js 14 (App Router) + TypeScript + Tailwind
- Fastify + TypeScript
- PostgreSQL + Prisma
- JWT auth via httpOnly cookies
- Stripe test checkout abstraction + dev email logging

## Structure
- `apps/web` storefront + admin UI
- `apps/api` backend API
- `packages/shared` zod schemas/shared validators

## Setup
1. `cp .env.example .env`
2. `docker compose up -d`
3. `pnpm i`
4. `pnpm db:migrate`
5. `pnpm db:seed`
6. `pnpm dev`

Web: http://localhost:3000
API: http://localhost:4000

## Scripts
- `pnpm dev`
- `pnpm db:migrate`
- `pnpm db:seed`
- `pnpm test`

## Admin Credentials
- Email: `admin@example.com`
- Password: `Admin123!`

## Stripe Test Card
- `4242 4242 4242 4242`
- Any future expiry and CVC

## Features
- Hebrew-first RTL UI
- Product catalog with categories, brands, variants, stock
- Cart (guest via cart cookie), checkout, order creation
- Admin login + products/orders/shipping management basics
- Content pages (about/contact/faq/policies/how-to-get-here)
- SEO basics (`robots`, `sitemap`, metadata)
- Optional GA4 hook by env var
- Floating WhatsApp button on all pages

## Notes
- Product image upload is local/URL placeholder based for MVP and can be swapped to S3 adapter later.
- Email provider abstraction logs to console in dev.
- Payment provider uses Stripe if secret key exists; otherwise direct success flow.
