import { NextResponse } from "next/server";
import { z } from "zod";
import db from "@/lib/db";
import { withPermission, assertSameOrigin } from "@/lib/api-guard";

export const runtime = "nodejs";

// Maps the JSON body keys to the site_settings keys they are stored under.
const KEY_MAP = {
  scheduling_url: "calendar_scheduling_url",
  embed_src: "calendar_embed_src",
  coty_form_src: "calendar_coty_form_src",
  acaa_form_src: "calendar_acaa_form_src",
} as const;

const urlField = z.string().url().max(2000).or(z.literal("")).optional();

const schema = z.object({
  scheduling_url: urlField,
  embed_src: urlField,
  coty_form_src: urlField,
  acaa_form_src: urlField,
});

// PUT /api/admin/calendar-settings — upsert the calendar page URLs.
export async function PUT(req: Request) {
  return withPermission("content.calendar", async () => {
    assertSameOrigin(req);
    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input. All values must be valid URLs." },
        { status: 400 }
      );
    }

    for (const [field, settingKey] of Object.entries(KEY_MAP)) {
      const value = parsed.data[field as keyof typeof KEY_MAP];
      if (value === undefined) continue;
      await db.query(
        `INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)
           ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
        [settingKey, value || null]
      );
    }

    return NextResponse.json({ ok: true });
  });
}
