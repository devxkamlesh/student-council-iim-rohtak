import { NextResponse } from "next/server";
import { z } from "zod";
import type { ResultSetHeader } from "mysql2";
import db from "@/lib/db";
import { withPermission, assertSameOrigin } from "@/lib/api-guard";
import { sanitizeRichText } from "@/lib/sanitize";

export const runtime = "nodejs";

const schema = z.object({
  name: z.string().min(2).max(255),
  description: z.string().max(20000).optional().default(""),
  images: z.array(z.string().url().max(1000)).max(12).default([]),
  displayOrder: z.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true),
});

// POST /api/admin/events — create a flagship event
export async function POST(req: Request) {
  return withPermission("content.events", async () => {
    assertSameOrigin(req);
    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input. Image URLs must be valid links." },
        { status: 400 }
      );
    }
    const { name, images, displayOrder, isActive } = parsed.data;
    const description = sanitizeRichText(parsed.data.description);

    const [result] = await db.query<ResultSetHeader>(
      "INSERT INTO events (name, event_type, description, gallery, display_order, is_active) VALUES (?, 'flagship', ?, ?, ?, ?)",
      [name, description, JSON.stringify(images), displayOrder, isActive ? 1 : 0]
    );
    return NextResponse.json({ ok: true, id: result.insertId }, { status: 201 });
  });
}
