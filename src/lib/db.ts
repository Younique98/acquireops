import { Pool } from "pg";

if (typeof window === "undefined" && process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// Most managed Postgres providers (Vercel Postgres, Neon, Supabase, Railway)
// hand you a single connection string rather than separate host/user/password
// fields - support both so this works locally and on whichever provider gets
// connected on Vercel. POSTGRES_URL is Vercel's own naming; DATABASE_URL is
// the near-universal convention everyone else uses.
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

const pool = connectionString
  ? new Pool({
      connectionString,
      // Managed providers require SSL for external connections; a local
      // connection string (no managed host) doesn't need or support it.
      ssl: /localhost|127\.0\.0\.1/.test(connectionString)
        ? undefined
        : { rejectUnauthorized: false },
    })
  : new Pool({
      user: process.env.DATABASE_USER,
      host: process.env.DATABASE_HOST,
      database: process.env.DATABASE_NAME,
      password: process.env.DATABASE_PASSWORD,
      port: process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT) : 5432,
    });

export default pool;
