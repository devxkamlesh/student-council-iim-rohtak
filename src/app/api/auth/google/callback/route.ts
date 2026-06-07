import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  findOrCreateUserByEmail,
  createSession,
  touchLogin,
  getClientIp,
  AuthError,
} from "@/lib/auth";

export const runtime = "nodejs";

function fail(req: Request, code: string) {
  return NextResponse.redirect(new URL(`/login?error=${code}`, req.url));
}

// GET /api/auth/google/callback — Google redirects here with ?code & ?state.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const jar = await cookies();
  const savedState = jar.get("g_oauth_state")?.value;
  jar.delete("g_oauth_state");

  // CSRF check.
  if (!code || !state || !savedState || state !== savedState) {
    return fail(req, "oauth_state");
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return fail(req, "google_unconfigured");

  const redirectUri = `${url.origin}/api/auth/google/callback`;

  // 1) Exchange the authorization code for an access token.
  let accessToken: string;
  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    if (!tokenRes.ok) return fail(req, "oauth_token");
    const token = await tokenRes.json();
    accessToken = token.access_token;
    if (!accessToken) return fail(req, "oauth_token");
  } catch {
    return fail(req, "oauth_token");
  }

  // 2) Fetch the verified user profile.
  let profile: { email?: string; email_verified?: boolean; name?: string };
  try {
    const infoRes = await fetch(
      "https://openidconnect.googleapis.com/v1/userinfo",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!infoRes.ok) return fail(req, "oauth_userinfo");
    profile = await infoRes.json();
  } catch {
    return fail(req, "oauth_userinfo");
  }

  const email = (profile.email || "").toLowerCase().trim();
  const verified = profile.email_verified === true;
  const domain = (process.env.ALLOWED_EMAIL_DOMAIN || "").toLowerCase();

  // 3) Enforce verified email on the allowed domain.
  if (!email || !verified) return fail(req, "email_unverified");
  if (domain && !email.endsWith(`@${domain}`)) return fail(req, "domain");

  // 4) Find or auto-create the user, then start a session.
  try {
    const userId = await findOrCreateUserByEmail(email, profile.name || email);
    await touchLogin(userId);
    await createSession(userId, getClientIp(req.headers), req.headers.get("user-agent"));
  } catch (e) {
    if (e instanceof AuthError) return fail(req, "account_disabled");
    console.error("Google sign-in error:", e);
    return fail(req, "server");
  }

  return NextResponse.redirect(new URL("/admin", req.url));
}
