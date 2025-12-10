Beep Beep
=========

Marketplace ops dashboard built with Next.js for connecting an eBay account, syncing business policies, listing products, and managing SKUs. Uses App Router, NextAuth, Prisma/PostgreSQL, and Tailwind CSS.

Features
- eBay OAuth connect/disconnect with marketplace + scope selection
- Listing creation/validation, duplicate checks, and search workflow
- Business policy sync (payment/shipping/return) and SKU prefix/counter tools
- Authenticated dashboard with role-aware API routes

Tech Stack
- Next.js 16 (App Router), React 19, TypeScript
- NextAuth 5 (beta) with Prisma adapter
- PostgreSQL + Prisma ORM
- Tailwind CSS 4 (postcss build)

Prerequisites
- Node.js 20+ and npm
- PostgreSQL database (local or hosted)
- eBay Developer account with production credentials and registered RuName

Setup
1) Install dependencies  
`npm install`

2) Configure environment  
Copy `env.example` to `.env.local` and fill values:
- `DATABASE_URL` – Postgres connection string
- `NEXTAUTH_URL` and `NEXTAUTH_SECRET`
- `EBAY_SANDBOX` – `"true"` for sandbox, `"false"` for production
- `EBAY_CLIENT_ID`, `EBAY_CLIENT_SECRET` – from eBay Dev Portal
- `EBAY_RUNAME` – production RuName registered in eBay
- `EBAY_MARKETPLACE_ID` – e.g. `EBAY_US`
- `EBAY_SCOPE` – keep required scopes unless you know you can reduce them

3) Prepare database  
`npm run db:push` (applies schema)  
`npm run db:generate` (Prisma client)

4) Run the app  
`npm run dev` then open http://localhost:3000

Useful scripts
- `npm run lint` – lint the project
- `npm run build` / `npm run start` – production build and serve

Deployment notes
- Ensure `.env.local` values (including RuName callback) match the deployed URL.
- Run `npm run build` as part of your deployment pipeline.
