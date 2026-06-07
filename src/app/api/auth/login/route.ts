import { NextResponse } from "next/server";
import { z } from "zod";
import type { RowDataPacket, ResultSetHeader } from "mysql2";
import db from "@/lib/db";
import {
  verifyPassword,
  createSession,
  isIpRateLimited,
  recordLoginAttempt,
  accountLockConfig,
  getClientIp,
} from "@/lib/auth";

export const runtime = "nodejs";

const schema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(200),
});

// A throwaway hash so we always spend ~equal time even when the user is
// unknown — prevents user-enumeration via response timing.
const DUMMY_HASH = "$2a$12$CwTycUXWue0Thq9StjUM0uJ8Dr8K9z6Xh8z6Xh8z6Xh8z6Xh8z6Xe";

const GENERIC_ERROR = "Invalid email or password.";

export async function POST(req: Request) {
  // --- CSRF / origin check ---
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (origin && host && new URL(origin).host !== host) {
    return NextResponse.json({ error: "Bad origin." }, { status: 403 });
  }

  const ip = getClientIp(req.headers);

  // --- IP rate limit ---
  if (await isIpRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      { status: 429 }
    );
  }

  // --- Validate input ---
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 });
  }
  const email = parsed.data.email.toLowerCase().trim();
  const { password } = parsed.data;

  // --- Look up user ---
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT id, password_hash, is_active, failed_attempts, locked_until
       FROM users WHERE email = ? LIMIT 1`,
    [email]
  );
  const user = rows[0];

  // --- Account lock check ---
  if (user && user.locked_until && new Date(user.locked_until) > new Date()) {
    await recordLoginAttempt(email, ip, false);
    return NextResponse.json(
      { error: "Account temporarily locked. Try again later." },
      { status: 423 }
    );
  }

  // --- Verify password (always run bcrypt to equalize timing) ---
  const hash = user?.password_hash ?? DUMMY_HASH;
  const ok = await verifyPassword(password, hash);

  if (!user || !user.is_active || !ok) {
    await recordLoginAttempt(email, ip, false);
    // Increment failure counter + lock if threshold reached
    if (user) {
      const fails = Number(user.failed_attempts) + 1;
      if (fails >= accountLockConfig.MAX_ACCOUNT_FAILS) {
        await db.query<ResultSetHeader>(
          "UPDATE users SET failed_attempts = 0, locked_until = (NOW() + INTERVAL ? MINUTE) WHERE id = ?",
          [accountLockConfig.ACCOUNT_LOCK_MINUTES, user.id]
        );
      } else {
        await db.query<ResultSetHeader>(
          "UPDATE users SET failed_attempts = ? WHERE id = ?",
          [fails, user.id]
        );
      }
    }
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  // --- Success ---
  await db.query<ResultSetHeader>(
    "UPDATE users SET failed_attempts = 0, locked_until = NULL, last_login_at = NOW() WHERE id = ?",
    [user.id]
  );
  await recordLoginAttempt(email, ip, true);
  await createSession(user.id, ip, req.headers.get("user-agent"));

  return NextResponse.json({ ok: true });
}
