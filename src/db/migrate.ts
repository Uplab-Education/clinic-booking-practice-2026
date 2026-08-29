// Applies pending migrations from ./drizzle.
//   npm run db:migrate
// This replaces `drizzle-kit migrate`, which prints nothing when a migration
// fails: it swallows the database error and just exits with code 1, so a
// broken migration looks like a successful one. Here the Postgres error is
// printed in full, together with the name of the migration that failed.

import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { readFile } from "node:fs/promises";
import postgres from "postgres";

// Same folder as `out` in drizzle.config.ts.
const MIGRATIONS_FOLDER = "./drizzle";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is not set. Copy .env.example to .env.local first.");
  process.exit(1);
}

// `onnotice` silences the "schema already exists, skipping" notices that
// Postgres emits on every run: they are informational and only add noise.
const client = postgres(databaseUrl, { max: 1, prepare: false, onnotice: () => {} });
const db = drizzle(client);

/**
 * Name of the migration that is about to run, i.e. the first one in the
 * journal that the database has not recorded yet. Drizzle applies migrations
 * in journal order and stops at the first failure, so this is the one that
 * broke. Returns null if that cannot be determined.
 */
async function pendingMigrationTag() {
  let journal: { entries: { when: number; tag: string }[] };

  try {
    journal = JSON.parse(await readFile(`${MIGRATIONS_FOLDER}/meta/_journal.json`, "utf8"));
  } catch {
    return null;
  }

  // Drizzle stores each journal entry's `when` as the row's created_at. On a
  // fresh database the table does not exist yet, which means nothing has been
  // applied rather than "cannot tell".
  let appliedAt = new Set<number>();

  try {
    const applied = await db.execute<{ created_at: string }>(
      `select created_at from drizzle.__drizzle_migrations`,
    );
    appliedAt = new Set(applied.map((row) => Number(row.created_at)));
  } catch {
    appliedAt = new Set();
  }

  return journal.entries.find((entry) => !appliedAt.has(entry.when))?.tag ?? null;
}

/** Postgres errors carry the useful details; drizzle wraps them as `cause`. */
function describeDatabaseError(error: unknown) {
  const candidate = error as { cause?: unknown };
  const pgError = (candidate?.cause ?? error) as {
    message?: string;
    code?: string;
    detail?: string;
    hint?: string;
    table_name?: string;
    column_name?: string;
    constraint_name?: string;
  };

  const lines = [`  message: ${pgError.message ?? String(error)}`];

  for (const [label, value] of [
    ["code", pgError.code],
    ["detail", pgError.detail],
    ["hint", pgError.hint],
    ["table", pgError.table_name],
    ["column", pgError.column_name],
    ["constraint", pgError.constraint_name],
  ] as const) {
    if (value) {
      lines.push(`  ${label}: ${value}`);
    }
  }

  return lines.join("\n");
}

try {
  const pending = await pendingMigrationTag();

  console.log("Applying migrations...");
  await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
  console.log(pending ? "Migrations applied." : "Already up to date, nothing to apply.");
} catch (error) {
  const failed = await pendingMigrationTag();

  console.error(
    failed
      ? `\nMigration failed: ${failed}.sql was not applied.`
      : "\nMigration failed.",
  );
  console.error(describeDatabaseError(error));
  console.error("\nThe database is unchanged: a failed migration is rolled back.");
  process.exitCode = 1;
} finally {
  await client.end();
}
