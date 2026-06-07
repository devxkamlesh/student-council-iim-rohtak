// Fixes the Spirituality, Health & Wellness Club logo in the database.
// Idempotent — safe to re-run.
// Usage: npx tsx scripts/fix-club-logos.ts
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

const WELLNESS_LOGO =
  "https://studentcounciliimr.in/wp-content/uploads/2025/11/WhatsApp_Image_2025-11-26_at_5.55.54_PM-removebg-preview.png";

const INQUIZIRE_LOGO =
  "https://studentcounciliimr.in/wp-content/uploads/2025/11/unnamed.webp";

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

  const [res] = await conn.query(
    "UPDATE clubs SET image_url = ? WHERE name = ?",
    [WELLNESS_LOGO, "Spirituality, Health & Wellness Club"]
  );
  console.log("Updated Spirituality, Health & Wellness Club logo:", res);

  const [res2] = await conn.query(
    "UPDATE clubs SET image_url = ? WHERE name = ?",
    [INQUIZIRE_LOGO, "The Inquizire Club"]
  );
  console.log("Updated The Inquizire Club logo:", res2);

  await conn.end();
  console.log("Done.");
}

main().catch((err) => {
  console.error("fix-club-logos failed:", err);
  process.exit(1);
});
