import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

// Neon Postgres over HTTP (one round trip per query, fine on serverless).
// Everything the portfolio stores lives in the `portfolio` schema (db/portfolio.sql),
// apart from the other tables that share this database.
let client: NeonQueryFunction<false, false> | null = null;

/** The database, or null when DATABASE_URL isn't configured (e.g. a fresh clone). */
export function db() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  client ??= neon(url);
  return client;
}
