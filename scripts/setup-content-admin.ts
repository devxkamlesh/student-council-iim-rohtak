// Adds the content.homepage permission (for "What We Do" cards), grants it to
// the Administrator role, and ensures shuttle_timings has a display_order
// column so it works with the generic content manager. Idempotent.
// Usage: npx tsx scripts/setup-content-admin.ts
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

  // 1) New permission for homepage highlight cards.
  await conn.query(
    `INSERT INTO permissions (perm_key, label, category) VALUES
       ('content.homepage', 'Manage homepage cards', 'Content')
     ON DUPLICATE KEY UPDATE label = VALUES(label)`
  );
  console.log("Ensured permission: content.homepage");

  // 2) Grant it to the Administrator role.
  const [adminRole] = await conn.query<mysql.RowDataPacket[]>(
    "SELECT id FROM roles WHERE slug = 'administrator' LIMIT 1"
  );
  const [perm] = await conn.query<mysql.RowDataPacket[]>(
    "SELECT id FROM permissions WHERE perm_key = 'content.homepage' LIMIT 1"
  );
  if (adminRole.length && perm.length) {
    await conn.query(
      "INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)",
      [adminRole[0].id, perm[0].id]
    );
    console.log("Granted content.homepage to Administrator.");
  }

  // 3) Add display_order to shuttle_timings if missing.
  try {
    await conn.query(
      "ALTER TABLE shuttle_timings ADD COLUMN display_order INT DEFAULT 0"
    );
    console.log("Added shuttle_timings.display_order.");
  } catch (e) {
    if ((e as { code?: string }).code === "ER_DUP_FIELDNAME") {
      console.log("shuttle_timings.display_order already exists — skipped.");
    } else throw e;
  }

  await conn.end();
  console.log("Done.");
}

main().catch((err) => {
  console.error("setup-content-admin failed:", err);
  process.exit(1);
});
