// Adds a `calendar.access` permission, creates the "Special Access (Calendar)"
// role with that permission, and also grants it to the Administrator role.
// Only users whose role has this permission can view the /calendar page.
// Idempotent — safe to re-run.
// Usage: npx tsx scripts/setup-calendar-access.ts
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

  // 1) Permissions: calendar access + admin panel access
  await conn.query(
    `INSERT INTO permissions (perm_key, label, category) VALUES
       ('calendar.access', 'Access calendar page', 'Special Access')
     ON DUPLICATE KEY UPDATE label = VALUES(label), category = VALUES(category)`
  );
  const [permRows] = await conn.query<mysql.RowDataPacket[]>(
    "SELECT id FROM permissions WHERE perm_key = 'calendar.access' LIMIT 1"
  );
  const permId = permRows[0].id as number;
  const [adminPermRows] = await conn.query<mysql.RowDataPacket[]>(
    "SELECT id FROM permissions WHERE perm_key = 'admin.access' LIMIT 1"
  );
  const adminPermId = adminPermRows.length ? (adminPermRows[0].id as number) : null;
  console.log("Permission 'calendar.access' ready.");

  // 2) Role: Special Access (Calendar) — gets BOTH calendar.access and admin.access
  await conn.query(
    `INSERT INTO roles (name, slug, description, is_system) VALUES
       ('Special Access (Calendar)', 'special-access-calendar', 'Can view the calendar page and access the admin panel', FALSE)
     ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description)`
  );
  const [roleRows] = await conn.query<mysql.RowDataPacket[]>(
    "SELECT id FROM roles WHERE slug = 'special-access-calendar' LIMIT 1"
  );
  const roleId = roleRows[0].id as number;
  await conn.query(
    "INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)",
    [roleId, permId]
  );
  if (adminPermId) {
    await conn.query(
      "INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)",
      [roleId, adminPermId]
    );
  }
  console.log("Role 'Special Access (Calendar)' configured with calendar.access + admin.access.");

  // 3) Grant to Administrator too (admins keep full access)
  const [adminRows] = await conn.query<mysql.RowDataPacket[]>(
    "SELECT id FROM roles WHERE slug = 'administrator' LIMIT 1"
  );
  if (adminRows.length) {
    await conn.query(
      "INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)",
      [adminRows[0].id, permId]
    );
    console.log("Granted calendar.access to Administrator.");
  }

  await conn.end();
  console.log("Done.");
}

main().catch((err) => {
  console.error("setup-calendar-access failed:", err);
  process.exit(1);
});
