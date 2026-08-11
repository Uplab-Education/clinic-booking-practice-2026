import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type Database = ReturnType<typeof createDb>;

let db: Database | null = null;

function createDb() {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and start the database with `docker compose up -d`.",
    );
  }

  // `prepare: false` keeps the client compatible with connection poolers
  // (e.g. the pooled Neon connection string used in production).
  const client = postgres(url, { max: 5, prepare: false });

  return drizzle(client, { schema });
}

export function getDb() {
  db ??= createDb();
  return db;
}
