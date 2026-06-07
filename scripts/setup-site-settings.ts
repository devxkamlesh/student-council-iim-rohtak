// Creates a key/value site_settings table, adds a `content.settings` permission,
// grants it to the Administrator role. Idempotent.
// Usage: npx tsx scripts/setup-site-settings.ts
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
    CREATE TABLE IF NOT EXISTS site_settings (
      setting_key VARCHAR(100) PRIMARY KEY,
      setting_value VARCHAR(1000),
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  console.log("site_settings table ready.");

  await conn.query(
    `INSERT INTO permissions (perm_key, label, category) VALUES
       ('content.settings', 'Manage site settings (logo, banner, footer)', 'Content')
     ON DUPLICATE KEY UPDATE label = VALUES(label), category = VALUES(category)`
  );
  const [permRows] = await conn.query<mysql.RowDataPacket[]>(
    "SELECT id FROM permissions WHERE perm_key = 'content.settings' LIMIT 1"
  );
  const permId = permRows[0].id as number;
  const [adminRows] = await conn.query<mysql.RowDataPacket[]>(
    "SELECT id FROM roles WHERE slug = 'administrator' LIMIT 1"
  );
  if (adminRows.length) {
    await conn.query(
      "INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)",
      [adminRows[0].id, permId]
    );
    console.log("Granted content.settings to Administrator.");
  }

  await conn.end();
  console.log("Done.");
}

main().catch((err) => {
  console.error("setup-site-settings failed:", err);
  process.exit(1);
});
