/**
 * Adds PushSubscription table to Turso
 * Run: TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... npx tsx scripts/add-push-table.ts
 */
import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL!;
const authToken = process.env.TURSO_AUTH_TOKEN;
const client = createClient({ url, authToken });

async function run() {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS "PushSubscription" (
      id           TEXT PRIMARY KEY,
      userId       TEXT NOT NULL,
      endpoint     TEXT NOT NULL UNIQUE,
      p256dh       TEXT NOT NULL,
      auth         TEXT NOT NULL,
      reminderHour INTEGER NOT NULL DEFAULT 18,
      createdAt    DATETIME NOT NULL DEFAULT (datetime('now'))
    )
  `);
  console.log("✅ PushSubscription table ready");
  client.close();
}

run().catch(console.error);
