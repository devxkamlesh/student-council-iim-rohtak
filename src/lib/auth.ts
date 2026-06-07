import "server-only";
import bcrypt from "bcryptjs";
import { randomBytes, createHash } from "node:crypto";
import { cookies } from "next/headers";
import type { RowDataPacket } from "mysql2";
import db from "@/lib/db";

const COOKIE_NAME = "sc_session";
const SESSION_DAYS = 7;
const BCRYPT_COST = 12;

// Brute-force thresholds
const MAX_ACCOUNT_FAILS = 5; // lock account after this many consecutive fails
const ACCOUNT_LOCK_MINUTES = 15;
const MAX_IP_FAILS = 20; // per IP within the window
const IP_WINDOW_MINUTES = 15;

export type SessionUser = {
  id: number;
  name: string;
  email: string;
  roleName: string | null;
  roleSlug: string | null;
  permissions: string[];
};

// ---------- Password helpers ----------
export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_COST);
}
export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// ---------- Token helpers ----------
function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

// ---------- Session lifecycle ----------
export async function createSession(
  userId: number,
  ip: string | null,
  userAgent: string | null
): Promise<void> {
  const token = randomBytes(32).toString("hex"); // raw token -> cookie
  const tokenHash = sha256(token); // only the hash is stored
  const expires = new Date(Date.now() + SESSION_DAYS * 86400_000);

  await db.query(
    "INSERT INTO sessions (user_id, token_hash, expires_at, ip, user_agent) VALUES (?, ?, ?, ?, ?)",
    [userId, tokenHash, expires, ip, (userAgent ?? "").slice(0, 255)]
  );

  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (token) {
    await db.query("DELETE FROM sessions WHERE token_hash = ?", [sha256(token)]);
  }
  jar.delete(COOKIE_NAME);
}

/** Returns the logged-in user (with permissions) or null. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;

  // Single query: session -> user -> role, with permissions aggregated.
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT u.id, u.name, u.email, u.is_active,
            r.name AS role_name, r.slug AS role_slug,
            GROUP_CONCAT(p.perm_key) AS perm_keys
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       LEFT JOIN roles r ON r.id = u.role_id
       LEFT JOIN role_permissions rp ON rp.role_id = u.role_id
       LEFT JOIN permissions p ON p.id = rp.permission_id
      WHERE s.token_hash = ? AND s.expires_at > NOW()
      GROUP BY u.id, u.name, u.email, u.is_active, r.name, r.slug
      LIMIT 1`,
    [sha256(token)]
  );
  const row = rows[0];
  if (!row || !row.is_active) return null;

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    roleName: row.role_name ?? null,
    roleSlug: row.role_slug ?? null,
    permissions: row.perm_keys ? String(row.perm_keys).split(",") : [],
  };
}

export function hasPermission(user: SessionUser | null, perm: string): boolean {
  return !!user && user.permissions.includes(perm);
}

// ---------- Guards (throwing helpers for pages / route handlers) ----------
export class AuthError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new AuthError(401, "Not authenticated");
  return user;
}

export async function requirePermission(perm: string): Promise<SessionUser> {
  const user = await requireUser();
  if (!hasPermission(user, perm)) throw new AuthError(403, "Forbidden");
  return user;
}

// ---------- Brute-force protection ----------
export async function isIpRateLimited(ip: string | null): Promise<boolean> {
  if (!ip) return false;
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS c FROM login_attempts
      WHERE ip = ? AND success = FALSE
        AND created_at > (NOW() - INTERVAL ? MINUTE)`,
    [ip, IP_WINDOW_MINUTES]
  );
  return Number(rows[0].c) >= MAX_IP_FAILS;
}

export async function recordLoginAttempt(
  email: string,
  ip: string | null,
  success: boolean
): Promise<void> {
  await db.query(
    "INSERT INTO login_attempts (email, ip, success) VALUES (?, ?, ?)",
    [email.slice(0, 255), ip, success]
  );
}

export const accountLockConfig = {
  MAX_ACCOUNT_FAILS,
  ACCOUNT_LOCK_MINUTES,
};

/** Extract the best-guess client IP from request headers. */
export function getClientIp(headers: Headers): string | null {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return headers.get("x-real-ip");
}

// ---------- Google / OAuth user provisioning ----------

/** Ensure the default "Member" role exists; returns its id. */
async function ensureDefaultRole(): Promise<number> {
  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT id FROM roles WHERE slug = 'member' LIMIT 1"
  );
  if (rows[0]) return rows[0].id;
  const [res] = await db.query<import("mysql2").ResultSetHeader>(
    "INSERT INTO roles (name, slug, description, is_system) VALUES ('Member','member','Default role for new sign-ins', FALSE)"
  );
  return res.insertId;
}

/**
 * Finds a user by email, or auto-creates one with the default role.
 * Used by Google sign-in. Throws AuthError if the account is disabled.
 */
export async function findOrCreateUserByEmail(
  email: string,
  name: string
): Promise<number> {
  const normalized = email.toLowerCase().trim();
  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT id, is_active FROM users WHERE email = ? LIMIT 1",
    [normalized]
  );
  if (rows[0]) {
    if (!rows[0].is_active) throw new AuthError(403, "Account disabled");
    return rows[0].id;
  }

  const roleId = await ensureDefaultRole();
  // Random, unusable password — these users sign in via Google only.
  const placeholder = await bcrypt.hash(randomBytes(24).toString("hex"), BCRYPT_COST);
  const [res] = await db.query<import("mysql2").ResultSetHeader>(
    "INSERT INTO users (name, email, password_hash, role_id) VALUES (?, ?, ?, ?)",
    [name.slice(0, 255) || normalized, normalized, placeholder, roleId]
  );
  return res.insertId;
}

/** Marks the user's last login timestamp. */
export async function touchLogin(userId: number): Promise<void> {
  await db.query(
    "UPDATE users SET failed_attempts = 0, locked_until = NULL, last_login_at = NOW() WHERE id = ?",
    [userId]
  );
}

/** True if the given role id is the system Administrator role. */
export async function isAdministratorRole(roleId: number): Promise<boolean> {
  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT slug FROM roles WHERE id = ? LIMIT 1",
    [roleId]
  );
  return rows[0]?.slug === "administrator";
}
