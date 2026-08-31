# AcquireOps

A private tool for evaluating and tracking rental property acquisitions:
a deal pipeline, an underwriting calculator, and portfolio-level equity
tracking. Built as the acquisitions/expansion counterpart to TranquilOps
(day-to-day property operations) - this tool covers finding, evaluating,
and growing a portfolio, not managing tenants or rent collection.

## Features

- **Deal pipeline** - track candidate properties through stages: watching
  → analyzing → offer made → under contract → owned (or passed/sold)
- **Underwriting calculator** - enter purchase price, rent, expenses, and
  financing terms; get cap rate, cash-on-cash return, monthly cash flow,
  the 1% rule, and DSCR automatically
- **Equity tracking** - for owned properties, track current value and
  mortgage balance over time; the dashboard charts portfolio equity as a
  trend
- **Cash-out refi estimate** - how much equity is available to pull at a
  typical 75% max LTV (a planning estimate, not a lender commitment)
- **Redeploy-capital flag** - surfaces when a property's cash flow is
  returning less than 6% against its current equity, a common landlord
  rule of thumb for when refinancing or selling may be more effective
  than continuing to hold

None of the financial signals here (refi estimate, redeploy-capital flag,
hold/sell framing) are professional financial or tax advice - they're
planning heuristics based on the numbers you enter. A CPA or lender should
weigh in on anything with real tax or lending consequences.

## Tech Stack

- **Framework:** Next.js (App Router), TypeScript, Tailwind CSS
- **Database:** PostgreSQL
- **Auth:** HTTP Basic Auth via middleware (see below)

## Getting Started

1. Clone the repository:
   ```sh
   git clone https://github.com/Younique98/web-scraper-for-real-estate-company.git
   cd web-scraper-for-real-estate-company
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Set up a local Postgres database, copy `.env.example` to `.env.local`
   with your connection details, then seed it:
   ```sh
   psql -U <user> -d <database> -f seed.sql
   ```
   This seeds one example property - delete it once you've added your
   real portfolio.
4. **Set `ADMIN_USERNAME`/`ADMIN_PASSWORD`** in `.env.local` before
   deploying anywhere real. This app holds real personal financial data;
   without these set, it's unauthenticated. Local dev works without them
   for convenience.
5. Start the development server:
   ```sh
   npm run dev
   ```

Then open [http://localhost:3000](http://localhost:3000)

## Testing

```sh
npm run test
```

The underwriting math (`src/lib/underwriting.ts`) and portfolio equity
trend computation (`src/lib/portfolio.ts`) are unit tested against
hand-verified expected values, since this app is meant to inform real
purchase decisions.

## Deploying to Vercel

1. Import this repo into a new Vercel project.
2. Add a Postgres database from Vercel's Storage tab (Vercel Postgres,
   or connect Neon/Supabase) - it will inject a connection string
   (`DATABASE_URL` or `POSTGRES_URL`) automatically, which `src/lib/db.ts`
   picks up on its own.
3. In Project Settings -> Environment Variables, set `ADMIN_USERNAME` and
   `ADMIN_PASSWORD` **before the first deploy** - without them the app is
   unauthenticated.
4. Run `seed.sql` once against the new database (via the provider's query
   console, or `psql <connection-string> -f seed.sql` locally) to create
   the schema.
5. Deploy. Delete the seeded example property once you've added your real
   portfolio.
