import "server-only";
import { NextResponse } from "next/server";
import { requirePermission, AuthError, type SessionUser } from "@/lib/auth";

/** Runs `fn` only if the current user has `perm`; maps auth errors to responses. */
export async function withPermission(
  perm: string,
  fn: (user: SessionUser) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const user = await requirePermission(perm);
    return await fn(user);
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    console.error("API error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/** Rejects state-changing requests whose Origin doesn't match the Host (CSRF). */
export function assertSameOrigin(req: Request): void {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (origin && host && new URL(origin).host !== host) {
    throw new AuthError(403, "Bad origin");
  }
}
