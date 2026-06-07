import { NextResponse } from "next/server";
import { z } from "zod";
import db from "@/lib/db";
import { withPermission, assertSameOrigin } from "@/lib/api-guard";

export const runtime = "nodejs";

// Only these keys may be written.
const ALLOWED_KEYS = ["logo_url", "hero_banner_url", "footer_logo_url"] as const;

const schema = z.object({
  logo_url: z.string().url().max(1000).or(z.literal("")).optional(),
  hero_banner_url: z.string().max(1000).optional(),
  footer_logo_url: z.string().url().max(1000).or(z.literal("")).optional(),
});

// PUT /api/admin/site-settings — upsert branding settings.
export async function PUT(req: Request) {
  return withPermission("content.settings", async () => {
    assertSameOrigin(req);
    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input. Image URLs must be valid links." },
        { status: 400 }
      );
    }

    for (const key of ALLOWED_KEYS) {
      const value = parsed.data[key];
      if (value === undefined) continue;
      await db.query(
        `INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)
           ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
        [key, value || null]
      );
    }

    return NextResponse.json({ ok: true });
  });
}
