// Creates the council_batches table and seeds the existing batches.
// Exactly one batch is "current" (shown open/expanded on the homepage); all
// others are previous (collapsed). Idempotent.
// Usage: npx tsx scripts/setup-batches.ts
import mysql from "mysql2/promise";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv(): Record<string, string> {
  const env: Record<string, string> = {};
  const raw = readFileSync(join(root, ".env.local"), "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq > -1) env[t.slice(0, eq).trim()] = t.slice(eq + 1).trim();
  }
  return env;
}

async function main() {
  const env = loadEnv();
  const conn = await mysql.createConnection({
    host: env.DB_HOST,
    port: Number(env.DB_PORT) || 3306,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    connectTimeout: 20000,
  });
  console.log(`Connected to ${env.DB_HOST} / ${env.DB_NAME}`);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS council_batches (
      id INT AUTO_INCREMENT PRIMARY KEY,
      code VARCHAR(20) NOT NULL UNIQUE,
      label VARCHAR(50) NOT NULL,
      display_order INT DEFAULT 0,
      is_current BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log("council_batches table ready.");

  // Seed existing batches if empty.
  const [countRows] = await conn.query<mysql.RowDataPacket[]>(
    "SELECT COUNT(*) AS c FROM council_batches"
  );
  if (Number(countRows[0].c) === 0) {
    await conn.query(
      `INSERT INTO council_batches (code, label, display_order, is_current) VALUES
        ('SC16', "SC'16", 16, TRUE),
        ('SC15', "SC'15", 15, FALSE)`
    );
    console.log("Seeded batches: SC'16 (current), SC'15.");
  } else {
    console.log("Batches already exist — skipped seeding.");
  }

  await conn.end();
  console.log("Batch setup complete.");
}

main().catch((err) => {
  console.error("Batch setup failed:", err);
  process.exit(1);
});
