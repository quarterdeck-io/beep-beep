## Beep Beep

Marketplace operations dashboard for eBay sellers, built with Next.js App Router.  
Users can connect their eBay account, search products by UPC, create listings with safety checks, and control SKUs, pricing, and keyword filters.

### Core Features

- **Authentication & Access Control**
  - Email/password auth via **NextAuth credentials**.
  - Protected routes for `dashboard`, `ebay-connect`, and `product-search` via `middleware`.

- **eBay Account Connect**
  - **OAuth connect/disconnect** flow using eBay RuName.
  - Validates required scopes (notably **`sell.inventory`** and **`sell.account`**).
  - Stores access + refresh tokens in Postgres (`EbayToken` model) and automatically refreshes tokens.

- **Product Search by UPC**
  - Search eBay **Browse API** with a typed or scanned UPC.
  - HTML5 barcode scanner (camera-based) with detailed debug logs and status messages.
  - Picks a random matching item but replaces its price with the **mean price of the latest 10 items**.
  - Pulls enhanced images from the **Catalog API** when possible, with smart fallbacks to seller images.

- **Listing Workflow**
  - Inline editing for **title, description, condition, and price** before listing.
  - **Discount engine**: subtracts a configurable USD amount and enforces a **minimum price floor** with UI warnings and a dedicated “reject item” flow.
  - **SKU generation**: per-user `SKU-0000{counter}` pattern with configurable prefix and persisted counter.
  - **Business policies**: uses the user’s saved or configured eBay **payment/fulfillment/return** policies.
  - **Item specifics (aspects)**: validates required aspects via Taxonomy API, surfaces missing fields to UI, and lets the user fill them via a guided form.
  - Publishes inventory-based listings via eBay **Inventory + Offer APIs**, with rich error handling for common failure modes (missing scopes, policies, etc.).

- **Duplicate Detection & Inventory Increase**
  - For a given UPC, searches existing inventory via Inventory API and detects **duplicate SKUs**.
  - If duplicates exist, offers a path to **increase inventory quantity** for the existing listing instead of re-listing.
  - Uses Inventory API + Trading API fallbacks to robustly update live listing quantity.

- **Settings Dashboard**
  - **SKU Settings**: prefix and next counter, with live preview and search helper.
  - **eBay Business Policies**: fetches and stores selected payment/return/fulfillment policies per user.
  - **Banned Keywords**: CRUD interface for banned words that are then removed/masked from titles/descriptions.
  - **Discount Settings**: global discount amount (USD off) and minimum price floor with preview examples.
  - **Default Edit Mode**: control whether product-search opens directly in edit mode.
  - **Universal Override Description**: optional global description text applied to *all* listings.

### Tech Stack

- **Frontend**
  - Next.js **16** (App Router)
  - React **19**
  - TypeScript
  - Tailwind CSS **4** (PostCSS build)

- **Auth & Backend**
  - **NextAuth v5 (beta)** with **Prisma adapter**
  - Credential-based login (email/password)
  - Middleware-based route protection

- **Data & Infra**
  - PostgreSQL
  - Prisma ORM (`schema.prisma` with models: `User`, `Account`, `Session`, `EbayToken`, `SkuSettings`, `EbayBusinessPolicies`, `BannedKeyword`, `DiscountSettings`, `OverrideDescriptionSettings`, `EditModeSettings`)

### High-Level Architecture

- **App routes (UI)**
  - `/` – marketing/landing page with CTA to **Sign up / Log in**.
  - `/login`, `/signup` – auth flows under `app/(auth)/`.
  - `/dashboard` – main hub; shows connection status and entry points to **Connect eBay**, **Product Search**, and **Settings**.
  - `/ebay-connect` – manages OAuth, connection status, and disconnect/revoke flow.
  - `/product-search` – UPC search, scanner UI, listing editor, duplicate detection, inventory adjustment, and listing to eBay.
  - `/settings` – configuration for SKUs, policies, discounts, banned keywords, edit mode, and universal override description.

- **API routes**
  - `app/api/auth/[...nextauth]/route.ts` – NextAuth handlers using `lib/auth.ts`.
  - `app/api/signup/route.ts` – signup endpoint (zod validation + bcrypt hashing).
  - `app/api/ebay/*`
    - `connect`, `callback`, `disconnect`, `check-connection` – OAuth lifecycle and token storage.
    - `search` – Browse + Catalog API product search, image enrichment, mean-price calculation.
    - `list` – full listing pipeline (inventory item → offer → publish) with aspect validation and robust error reporting.
    - `check-duplicate` – UPC-based search across inventory items to detect existing SKUs.
    - `increase-inventory` – increases quantity on existing live listings using Inventory API + Trading API fallbacks.
    - `policies` – fetches eBay business policies for the configured marketplace.
  - `app/api/settings/*`
    - `sku` (+ `counter`, `prefix`) – get/update quasi-global SKU settings per user.
    - `discount` – price discount and floor settings.
    - `banned-keywords` – keyword list management.
    - `ebay-policies` – save/load selected eBay policy IDs.
    - `edit-mode` – default edit mode toggle.
    - `override-description` – universal description toggle + body text.

- **Auth & Middleware**
  - `lib/auth.ts` – NextAuth configuration with credentials provider and Prisma adapter.
  - `middleware.ts` – redirects unauthenticated users from `/dashboard`, `/ebay-connect`, and `/product-search` to `/login`.

- **Utilities & Components**
  - `lib/prisma.ts` – singleton Prisma client.
  - `lib/keyword-masker.ts` – functions to **mask** or **remove** banned keywords and a client-side fetch helper.
  - `components/Navigation.tsx` – top nav (Dashboard / Connect eBay / Product Search / Settings) with session-aware user info + sign out.
  - `components/ProductSearchCard.tsx` – dashboard card for entering product search, locked until eBay is connected.
  - `components/SessionProvider.tsx` – wraps app in `next-auth` `SessionProvider`.

### Prerequisites

- **Node.js** 20+ and npm
- **PostgreSQL** database (local or hosted)
- **eBay Developer account** with:
  - Production app keys (Client ID/Secret)
  - Registered **RuName** (Redirect URL name) that matches the `.env` configuration

### Setup & Installation

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment**

   Copy `env.example` → `.env.local` and fill in:

   - **Database & NextAuth**
     - `DATABASE_URL` – Postgres connection string  
     - `NEXTAUTH_URL` – e.g. `http://localhost:3000` (or production URL)  
     - `NEXTAUTH_SECRET` – strong random string

   - **eBay configuration**
     - `EBAY_SANDBOX` – `"true"` for sandbox, `"false"` for production (defaults to production-style credentials)
     - `EBAY_CLIENT_ID`, `EBAY_CLIENT_SECRET` – from eBay Dev Portal (matching the environment)
     - `EBAY_RUNAME` – **production RuName** from Dev Portal (must match exactly what’s registered)
     - `EBAY_MARKETPLACE_ID` – e.g. `EBAY_US`
     - `EBAY_SCOPE` – **do not remove** the default scopes unless you know what you are doing; must include at least:
       - `https://api.ebay.com/oauth/api_scope`
       - `https://api.ebay.com/oauth/api_scope/sell.inventory`
       - `https://api.ebay.com/oauth/api_scope/sell.account`

3. **Prepare the database**

   ```bash
   npm run db:push      # Apply Prisma schema
   npm run db:generate  # Generate Prisma client
   ```

4. **Run the app locally**

   ```bash
   npm run dev
   ```

   Then open `http://localhost:3000`.

### NPM Scripts

- **`npm run dev`**: Start Next.js dev server.
- **`npm run build`**: Create production build.
- **`npm run start`**: Run production server.
- **`npm run lint`**: Run ESLint.
- **DB helpers**
  - `npm run db:push` – push schema to DB.
  - `npm run db:generate` – regenerate Prisma client.
  - `npm run db:sync` – push + generate.

### Typical User Flow

- **Onboarding**
  - Sign up at `/signup`, then log in at `/login`.
  - Land on `/dashboard`.

- **Connect eBay**
  - Navigate to **Connect eBay**.
  - Complete the OAuth consent (ensure all requested scopes are accepted).
  - On success, dashboard and product search are unlocked.

- **Configure Settings (recommended before listing)**
  - Set **SKU prefix** and starting **counter**.
  - Load and select **business policies**.
  - Configure **discount** and **minimum price floor**.
  - (Optional) Define **banned keywords**, **default edit mode**, and **universal override description**.

- **Search & List**
  - Go to **Product Search**.
  - Enter or scan a **UPC**.
  - Review/edit title, description, condition, and price (discounted and floor-enforced).
  - Address any **duplicate** warnings or **missing item specifics** prompts.
  - Click **List on eBay** to create and publish the listing.

- **Handling Duplicates**
  - If the UPC already exists in inventory, use **“Increase existing product inventory”** to bump quantity on the existing listing instead of creating a new one.

### eBay Integration Notes & Gotchas

- **Scopes**
  - Missing `sell.inventory` or `sell.account` will cause **Error 2004** and related listing failures; in that case the app will ask you to disconnect and reconnect with proper scopes.

- **RuName / redirect URI**
  - `EBAY_RUNAME` must match exactly what’s registered in eBay Dev Portal or token exchange will fail (`redirect_uri_mismatch`).

- **Images**
  - eBay can be strict about image dimensions; the app prefers **>640px** stock images or falls back to seller images to avoid listing errors.

- **Business Policies / Locations**
  - If no inventory location or policies exist, listing can fail; UI hints and API responses will usually indicate that you need to set them up in Seller Hub.

### Deployment Notes

- **Environment parity**: keep `NEXTAUTH_URL`, `EBAY_RUNAME`, and callback URLs aligned with the deployed host.
- Run `npm run build` in your CI/CD pipeline before `npm run start`.
- Ensure the production DB is migrated via `npm run db:push` (or via your migration strategy) before first boot.

