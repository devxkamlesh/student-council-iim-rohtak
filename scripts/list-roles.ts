// Lists every role with its description, user count, and permission keys.
// Usage: npx tsx scripts/list-roles.ts
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

  const [roles] = await conn.query<mysql.RowDataPacket[]>(
    `SELECT r.id, r.name, r.slug, r.description, r.is_system,
            (SELECT COUNT(*) FROM users u WHERE u.role_id = r.id) AS users
       FROM roles r ORDER BY r.is_system DESC, r.name`
  );
  const [perms] = await conn.query<mysql.RowDataPacket[]>(
    `SELECT rp.role_id, p.perm_key FROM role_permissions rp
       JOIN permissions p ON p.id = rp.permission_id`
  );
  const byRole = new Map<number, string[]>();
  for (const p of perms) {
    const a = byRole.get(p.role_id) ?? [];
    a.push(p.perm_key);
    byRole.set(p.role_id, a);
  }

  for (const r of roles) {
    console.log(`\n[${r.id}] ${r.name}  (slug: ${r.slug})  system=${!!r.is_system}  users=${r.users}`);
    console.log(`   description: ${r.description || "(none)"}`);
    console.log(`   permissions: ${(byRole.get(r.id) ?? []).join(", ") || "(none)"}`);
  }

  await conn.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
