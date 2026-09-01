# AcquireOps

A deal pipeline, underwriting calculator, and portfolio-level equity
tracker for evaluating and growing a rental property portfolio. Built as
the acquisitions/expansion counterpart to TranquilOps (day-to-day property
operations) - this tool covers finding, evaluating, and growing a
portfolio, not managing tenants or rent collection.

Multi-tenant: each account's properties, deal notes, and equity history
are private to that account.

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
- **Auth:** NextAuth (email/password, JWT sessions) - each account's data
  is scoped by `user_id` at the query level

## Getting Started

1. Clone the repository:
   ```sh
   git clone https://github.com/Younique98/acquireops.git
   cd acquireops
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
   This creates the schema and seeds one demo account
   (`demo@example.com` / `demo1234`) with one example property - sign up
   for your own real account instead of reusing it.
4. Set `NEXTAUTH_SECRET` (`openssl rand -base64 32`) and `NEXTAUTH_URL` in
   `.env.local`.
5. Start the development server:
   ```sh
   npm run dev
   ```

Then open [http://localhost:3000](http://localhost:3000) and sign up.

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
3. In Project Settings -> Environment Variables, set `NEXTAUTH_SECRET` and
   `NEXTAUTH_URL` (your production URL) before the first deploy.
4. Run `seed.sql` once against the new database (via the provider's query
   console, or `psql <connection-string> -f seed.sql` locally) to create
   the schema.
5. Deploy, then sign up for your own account and delete the seeded demo
   account once you've added your real portfolio.

## Upgrading an existing single-tenant database

If you deployed an earlier version of this app (properties with no
`user_id`, gated by HTTP Basic Auth instead of real accounts), run this
against your existing database before deploying this version, then sign
up for your account and update the `user_id` values to match:

```sql
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE properties ADD COLUMN IF NOT EXISTS user_id INT REFERENCES users(id) ON DELETE CASCADE;
-- after signing up and backfilling user_id for your existing rows:
ALTER TABLE properties ALTER COLUMN user_id SET NOT NULL;
```
