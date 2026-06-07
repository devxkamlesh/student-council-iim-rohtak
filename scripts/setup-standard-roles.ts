// Creates 3 ready-to-assign roles that bundle related permissions:
//   • Content Manager — manage all site content
//   • Site Manager    — manage navigation & site settings/branding
//   • User Manager     — manage admin users
// Existing roles (Administrator, Special Access, etc.) are left untouched.
// Idempotent — re-running re-syncs each role's permissions.
// Usage: npx tsx scripts/setup-standard-roles.ts
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

// Each role: slug, display name, description, and the permission keys it grants.
// admin.access is included so the user can enter the admin panel.
const ROLES: { slug: string; name: string; description: string; perms: string[] }[] = [
  {
    slug: "content-manager",
    name: "Content Manager",
    description: "Manage all site content — team, committees, clubs, events, gallery, homepage cards & timings.",
    perms: [
      "admin.access",
      "content.team",
      "content.committees",
      "content.clubs",
      "content.events",
      "content.gallery",
      "content.homepage",
      "content.leave",
    ],
  },
  {
    slug: "site-manager",
    name: "Site Manager",
    description: "Manage site structure & branding — navigation menu and site settings (logo, banner, footer).",
    perms: ["admin.access", "content.navigation", "content.settings"],
  },
  {
    slug: "user-manager",
    name: "User Manager",
    description: "Manage admin user accounts and their role assignments.",
    perms: ["admin.access", "users.view", "users.manage"],
  },
];

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

  // Map permission keys -> ids (only keys that actually exist).
  const [permRows] = await conn.query<mysql.RowDataPacket[]>(
    "SELECT id, perm_key FROM permissions"
  );
  const permId = new Map<string, number>();
  for (const p of permRows) permId.set(p.perm_key, p.id);

  for (const role of ROLES) {
    await conn.query(
      `INSERT INTO roles (name, slug, description, is_system) VALUES (?, ?, ?, FALSE)
         ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description)`,
      [role.name, role.slug, role.description]
    );
    const [r] = await conn.query<mysql.RowDataPacket[]>(
      "SELECT id FROM roles WHERE slug = ? LIMIT 1",
      [role.slug]
    );
    const roleId = r[0].id as number;

    for (const key of role.perms) {
      const pid = permId.get(key);
      if (!pid) {
        console.warn(`  ! permission "${key}" not found — skipped`);
        continue;
      }
      await conn.query(
        "INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)",
        [roleId, pid]
      );
    }
    console.log(`Configured role "${role.name}" with ${role.perms.length} permissions.`);
  }

  await conn.end();
  console.log("Done. Assign these roles to users from the Users page.");
}

main().catch((err) => {
  console.error("setup-standard-roles failed:", err);
  process.exit(1);
});
