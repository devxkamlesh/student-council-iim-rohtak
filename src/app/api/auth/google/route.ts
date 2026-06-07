import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";

export const runtime = "nodejs";

// GET /api/auth/google — redirect the user to Google's consent screen.
export async function GET(req: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.redirect(
      new URL("/login?error=google_unconfigured", req.url)
    );
  }

  const origin = new URL(req.url).origin;
  const redirectUri = `${origin}/api/auth/google/callback`;
  const domain = process.env.ALLOWED_EMAIL_DOMAIN || "";

  // CSRF state — stored in a short-lived cookie and echoed back by Google.
  const state = randomBytes(16).toString("hex");
  const jar = await cookies();
  jar.set("g_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600, // 10 minutes
  });

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
    access_type: "online",
  });
  // Hint Google to show only accounts on the institute domain (UX only —
  // the real domain check happens server-side in the callback).
  if (domain) params.set("hd", domain);

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  );
}
