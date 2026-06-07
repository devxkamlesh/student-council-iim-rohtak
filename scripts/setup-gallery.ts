// Creates the gallery_images table, adds a `content.gallery` permission, grants
// it to the Administrator role, and adds a "Gallery" nav link. Idempotent.
// Usage: npx tsx scripts/setup-gallery.ts
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

  // --- Table ---
  await conn.query(`
    CREATE TABLE IF NOT EXISTS gallery_images (
      id INT AUTO_INCREMENT PRIMARY KEY,
      public_id VARCHAR(255) NOT NULL,
      secure_url VARCHAR(1000) NOT NULL,
      width INT,
      height INT,
      format VARCHAR(20),
      bytes INT,
      caption VARCHAR(500),
      display_order INT DEFAULT 0,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log("gallery_images table ready.");

  // --- Permission ---
  await conn.query(
    `INSERT INTO permissions (perm_key, label, category) VALUES
       ('content.gallery', 'Manage gallery', 'Content')
     ON DUPLICATE KEY UPDATE label = VALUES(label), category = VALUES(category)`
  );
  const [permRows] = await conn.query<mysql.RowDataPacket[]>(
    "SELECT id FROM permissions WHERE perm_key = 'content.gallery' LIMIT 1"
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
    console.log("Granted content.gallery to Administrator.");
  }

  // --- Nav link (only if not already present) ---
  const [navRows] = await conn.query<mysql.RowDataPacket[]>(
    "SELECT id FROM nav_links WHERE href = '/gallery' LIMIT 1"
  );
  if (navRows.length === 0) {
    const [maxRows] = await conn.query<mysql.RowDataPacket[]>(
      "SELECT COALESCE(MAX(display_order), 0) AS m FROM nav_links WHERE parent_id IS NULL"
    );
    const order = Number(maxRows[0].m) + 1;
    await conn.query(
      "INSERT INTO nav_links (label, href, display_order, is_external) VALUES ('Gallery', '/gallery', ?, 0)",
      [order]
    );
    console.log("Added 'Gallery' nav link.");
  } else {
    console.log("'Gallery' nav link already exists — skipped.");
  }

  await conn.end();
  console.log("Done.");
}

main().catch((err) => {
  console.error("setup-gallery failed:", err);
  process.exit(1);
});
