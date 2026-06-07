// Creates authentication & RBAC tables, seeds permissions + an Administrator
// role, and creates the FIRST admin user with a randomly generated password
// (printed once). Idempotent for tables; will not duplicate the admin user.
// Usage: npx tsx scripts/setup-auth.ts
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
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

// The full set of permissions the application understands.
const PERMISSIONS: [string, string, string][] = [
  ["admin.access", "Access admin panel", "General"],
  ["users.view", "View users", "Users"],
  ["users.manage", "Create / edit / delete users", "Users"],
  ["roles.view", "View roles", "Roles"],
  ["roles.manage", "Create / edit / delete roles", "Roles"],
  ["content.team", "Manage team members", "Content"],
  ["content.committees", "Manage committees", "Content"],
  ["content.clubs", "Manage clubs", "Content"],
  ["content.events", "Manage events", "Content"],
  ["content.leave", "Manage leave & timings", "Content"],
  ["content.homepage", "Manage homepage cards", "Content"],
  ["content.navigation", "Manage navigation menu", "Content"],
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
    multipleStatements: true,
  });
  console.log(`Connected to ${env.DB_HOST} / ${env.DB_NAME}`);

  // --- Tables ---
  await conn.query(`
    CREATE TABLE IF NOT EXISTS roles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      slug VARCHAR(100) NOT NULL UNIQUE,
      description VARCHAR(255),
      is_system BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS permissions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      perm_key VARCHAR(100) NOT NULL UNIQUE,
      label VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS role_permissions (
      role_id INT NOT NULL,
      permission_id INT NOT NULL,
      PRIMARY KEY (role_id, permission_id),
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
      FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role_id INT,
      is_active BOOLEAN DEFAULT TRUE,
      is_system BOOLEAN DEFAULT FALSE,
      failed_attempts INT DEFAULT 0,
      locked_until DATETIME NULL,
      last_login_at DATETIME NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      token_hash CHAR(64) NOT NULL UNIQUE,
      expires_at DATETIME NOT NULL,
      ip VARCHAR(45),
      user_agent VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS login_attempts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255),
      ip VARCHAR(45),
      success BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_email_time (email, created_at),
      INDEX idx_ip_time (ip, created_at)
    );
  `);
  console.log("Tables ready.");

  // --- Seed permissions (upsert by key) ---
  for (const [key, label, category] of PERMISSIONS) {
    await conn.query(
      `INSERT INTO permissions (perm_key, label, category) VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE label = VALUES(label), category = VALUES(category)`,
      [key, label, category]
    );
  }
  console.log(`Seeded ${PERMISSIONS.length} permissions.`);

  // --- Administrator role with ALL permissions ---
  await conn.query(
    `INSERT INTO roles (name, slug, description, is_system) VALUES ('Administrator','administrator','Full access to everything', TRUE)
       ON DUPLICATE KEY UPDATE name = VALUES(name)`
  );
  const [roleRows] = await conn.query<mysql.RowDataPacket[]>(
    "SELECT id FROM roles WHERE slug = 'administrator'"
  );
  const adminRoleId = roleRows[0].id as number;

  const [permRows] = await conn.query<mysql.RowDataPacket[]>("SELECT id FROM permissions");
  for (const p of permRows) {
    await conn.query(
      `INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)`,
      [adminRoleId, p.id]
    );
  }
  console.log("Administrator role configured with all permissions.");

  // --- First admin user (only if none exists) ---
  const [userCount] = await conn.query<mysql.RowDataPacket[]>(
    "SELECT COUNT(*) AS c FROM users"
  );
  if (Number(userCount[0].c) === 0) {
    const email = "admin@studentcouncil.local";
    const tempPassword = randomBytes(9).toString("base64url"); // ~12 chars
    const hash = await bcrypt.hash(tempPassword, 12);
    await conn.query(
      "INSERT INTO users (name, email, password_hash, role_id, is_system) VALUES (?, ?, ?, ?, TRUE)",
      ["Administrator", email, hash, adminRoleId]
    );
    console.log("\n==================  FIRST ADMIN CREATED  ==================");
    console.log(`  Email:    ${email}`);
    console.log(`  Password: ${tempPassword}`);
    console.log("  >> Log in, then CHANGE this password immediately. <<");
    console.log("===========================================================\n");
  } else {
    console.log("Users already exist — skipped creating the default admin.");
  }

  await conn.end();
  console.log("Auth setup complete.");
}

main().catch((err) => {
  console.error("Auth setup failed:", err);
  process.exit(1);
});
