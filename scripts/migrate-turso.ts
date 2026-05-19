/**
 * Run Prisma migrations against Turso using @libsql/client directly.
 * Usage: TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... npx tsx scripts/migrate-turso.ts
 */
import { createClient } from "@libsql/client";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || url.startsWith("file:")) {
    console.error("Set TURSO_DATABASE_URL to a remote libsql:// URL");
    process.exit(1);
  }

  const client = createClient({ url, authToken });

  // Find all migration SQL files in order
  const migrationsDir = path.join(process.cwd(), "prisma", "migrations");
  const migrationDirs = fs
    .readdirSync(migrationsDir)
    .filter((d) => fs.statSync(path.join(migrationsDir, d)).isDirectory())
    .sort();

  for (const dir of migrationDirs) {
    const sqlFile = path.join(migrationsDir, dir, "migration.sql");
    if (!fs.existsSync(sqlFile)) continue;

    const sql = fs.readFileSync(sqlFile, "utf-8");
    // Split on semicolons followed by whitespace/newline, strip comment lines
    const statements = sql
      .split(/;\s*\n/)
      .map((s) =>
        s
          .split("\n")
          .filter((line) => !line.trim().startsWith("--"))
          .join("\n")
          .trim()
      )
      .filter((s) => s.length > 0);

    console.log(`Applying migration: ${dir} (${statements.length} statements)`);
    for (const stmt of statements) {
      try {
        await client.execute(stmt);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes("already exists")) {
          console.log(`  ⚠ Skipping (already exists): ${stmt.slice(0, 60)}...`);
        } else {
          console.error(`  ✗ Failed: ${stmt.slice(0, 80)}`);
          console.error(`    Error: ${msg}`);
          process.exit(1);
        }
      }
    }
    console.log(`  ✓ Done`);
  }

  console.log("\n✅ All migrations applied successfully.");
  client.close();
}

main();
