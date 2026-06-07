// Creates the nav_links table (supports sub-pages via parent_id), seeds the
// current menu, adds a content.navigation permission, and grants it to the
// Administrator role. Idempotent.
// Usage: npx tsx scripts/setup-nav.ts
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
    CREATE TABLE IF NOT EXISTS nav_links (
      id INT AUTO_INCREMENT PRIMARY KEY,
      label VARCHAR(100) NOT NULL,
      href VARCHAR(255) NOT NULL,
      parent_id INT NULL,
      display_order INT DEFAULT 0,
      is_external BOOLEAN DEFAULT FALSE,
      is_active BOOLEAN DEFAULT TRUE,
      FOREIGN KEY (parent_id) REFERENCES nav_links(id) ON DELETE CASCADE
    )
  `);
  console.log("nav_links table ready.");

  const [count] = await conn.query<mysql.RowDataPacket[]>(
    "SELECT COUNT(*) AS c FROM nav_links"
  );
  if (Number(count[0].c) === 0) {
    const items: [string, string, number, number][] = [
      ["Home", "/", 1, 0],
      ["Committees", "/committees", 2, 0],
      ["Clubs", "/clubs", 3, 0],
      ["RC's & Events", "/events", 4, 0],
      ["Leave & Others", "/leave", 5, 0],
      ["Student Form", "/student-form", 6, 0],
      ["E-Learning", "/e-learning", 7, 0],
      ["Calendar", "/calendar", 8, 0],
    ];
    for (const [label, href, order, ext] of items) {
      await conn.query(
        "INSERT INTO nav_links (label, href, display_order, is_external) VALUES (?, ?, ?, ?)",
        [label, href, order, ext]
      );
    }
    console.log(`Seeded ${items.length} nav links.`);
  } else {
    console.log("nav_links already populated — skipped seeding.");
  }

  // Permission
  await conn.query(
    `INSERT INTO permissions (perm_key, label, category) VALUES
       ('content.navigation', 'Manage navigation menu', 'Content')
     ON DUPLICATE KEY UPDATE label = VALUES(label)`
  );
  const [adminRole] = await conn.query<mysql.RowDataPacket[]>(
    "SELECT id FROM roles WHERE slug = 'administrator' LIMIT 1"
  );
  const [perm] = await conn.query<mysql.RowDataPacket[]>(
    "SELECT id FROM permissions WHERE perm_key = 'content.navigation' LIMIT 1"
  );
  if (adminRole.length && perm.length) {
    await conn.query(
      "INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)",
      [adminRole[0].id, perm[0].id]
    );
    console.log("Granted content.navigation to Administrator.");
  }

  await conn.end();
  console.log("Done.");
}

main().catch((err) => {
  console.error("setup-nav failed:", err);
  process.exit(1);
});
