import { NextResponse } from "next/server";
import { SITE } from "@/lib/data";
import { getSiteSettings, getCounts } from "@/lib/queries";
import { apiMeta } from "@/lib/attribution";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/info — core identity endpoint. Returns branding + live counts,
// with the developer attribution in _meta.
export async function GET() {
  let logoUrl = SITE.logo;
  let committees = 0;
  let clubs = 0;
  try {
    const [settings, counts] = await Promise.all([getSiteSettings(), getCounts()]);
    logoUrl = settings.logoUrl;
    committees = counts.committees;
    clubs = counts.clubs;
  } catch {
    /* fall back to defaults */
  }

  return NextResponse.json({
    name: SITE.name,
    tagline: SITE.tagline,
    description: SITE.description,
    url: SITE.url,
    email: SITE.email,
    logo: logoUrl,
    currentBatch: "SC'16",
    counts: { committees, clubs },
    _meta: apiMeta(),
  });
}
