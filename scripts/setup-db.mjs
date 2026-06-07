// One-time database setup: runs database/schema.sql against the configured DB.
// Reads credentials from .env.local (never hardcoded).
// Usage: node scripts/setup-db.mjs
import mysql from "mysql2/promise";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

// --- tiny .env.local parser ---
function loadEnv() {
  const env = {};
  try {
    const raw = readFileSync(join(root, ".env.local"), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const eq = t.indexOf("=");
      if (eq === -1) continue;
      env[t.slice(0, eq).trim()] = t.slice(eq + 1).trim();
    }
  } catch {
    console.error("Could not read .env.local");
    process.exit(1);
  }
  return env;
}

const env = loadEnv();

const conn = await mysql.createConnection({
  host: env.DB_HOST,
  port: Number(env.DB_PORT) || 3306,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  multipleStatements: true,
  connectTimeout: 20000,
});

console.log(`Connected to ${env.DB_HOST} / ${env.DB_NAME}`);

const sql = readFileSync(join(root, "database", "schema.sql"), "utf8");

try {
  await conn.query(sql);
  console.log("Schema executed successfully.");
  const [tables] = await conn.query("SHOW TABLES");
  console.log(`Tables now present: ${tables.length}`);
  console.table(tables);
} catch (err) {
  console.error("Error running schema:", err.code || "", err.message);
} finally {
  await conn.end();
}
