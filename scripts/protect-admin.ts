// Adds an `is_system` flag to users and marks the original Administrator
// account as system-generated. System users can ONLY be changed directly in
// the database — never through the admin UI/API. Idempotent.
// Usage: npx tsx scripts/protect-admin.ts
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

  // Add column (ignore if it already exists).
  try {
    await conn.query("ALTER TABLE users ADD COLUMN is_system BOOLEAN DEFAULT FALSE");
    console.log("Added users.is_system column.");
  } catch (e) {
    if ((e as { code?: string }).code === "ER_DUP_FIELDNAME") {
      console.log("users.is_system already exists — skipped.");
    } else throw e;
  }

  // Mark the original Administrator (oldest user holding the administrator role).
  const [admins] = await conn.query<mysql.RowDataPacket[]>(
    `SELECT u.id, u.email
       FROM users u
       JOIN roles r ON r.id = u.role_id
      WHERE r.slug = 'administrator'
      ORDER BY u.id
      LIMIT 1`
  );
  if (admins.length) {
    await conn.query("UPDATE users SET is_system = TRUE WHERE id = ?", [admins[0].id]);
    console.log(`Marked system admin: ${admins[0].email} (id ${admins[0].id}).`);
  } else {
    console.log("No administrator user found to mark.");
  }

  await conn.end();
  console.log("Done.");
}

main().catch((err) => {
  console.error("protect-admin failed:", err);
  process.exit(1);
});
