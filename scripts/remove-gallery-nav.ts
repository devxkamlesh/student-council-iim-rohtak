// Removes the public "Gallery" nav link — the gallery is admin-only now.
// Idempotent. Usage: npx tsx scripts/remove-gallery-nav.ts
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

  const [res] = await conn.query(
    "DELETE FROM nav_links WHERE href = '/gallery' OR label = 'Gallery'"
  );
  console.log("Removed Gallery nav link:", res);

  await conn.end();
  console.log("Done.");
}

main().catch((err) => {
  console.error("remove-gallery-nav failed:", err);
  process.exit(1);
});
