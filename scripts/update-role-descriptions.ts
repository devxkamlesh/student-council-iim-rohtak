// Sets a clear, accurate description for every role (permissions unchanged).
// Idempotent. Usage: npx tsx scripts/update-role-descriptions.ts
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

const DESCRIPTIONS: Record<string, string> = {
  administrator:
    "Full access — every section of the admin panel including all content, gallery, navigation, site settings, users and roles.",
  "content-manager":
    "Manage all site content: team, committees, clubs, events, gallery, homepage cards, and leave & timings.",
  "site-manager":
    "Manage site structure and branding: the navigation menu and site settings (logo, hero banner, footer logo).",
  "user-manager":
    "Manage admin user accounts — create, edit, deactivate users and assign their roles.",
  "special-access-calendar":
    "Access to the restricted Calendar page only (event booking, schedule, and COTY/ACAA forms). No other admin access.",
  member:
    "Default role for new Google sign-ins. Has no admin access until an administrator assigns a role.",
};

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

  for (const [slug, description] of Object.entries(DESCRIPTIONS)) {
    const [res] = await conn.query<mysql.ResultSetHeader>(
      "UPDATE roles SET description = ? WHERE slug = ?",
      [description, slug]
    );
    console.log(`${slug}: ${res.affectedRows ? "updated" : "not found (skipped)"}`);
  }

  await conn.end();
  console.log("Done.");
}

main().catch((err) => {
  console.error("update-role-descriptions failed:", err);
  process.exit(1);
});
