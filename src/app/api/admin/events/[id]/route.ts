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

// PUT /api/admin/events/[id]
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withPermission("content.events", async () => {
    assertSameOrigin(req);
    const { id: idStr } = await params;
    const id = Number(idStr);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: "Invalid id." }, { status: 400 });
    }
    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    }
    const { name, images, displayOrder, isActive } = parsed.data;
    const description = sanitizeRichText(parsed.data.description);

    await db.query<ResultSetHeader>(
      "UPDATE events SET name = ?, description = ?, gallery = ?, display_order = ?, is_active = ? WHERE id = ?",
      [name, description, JSON.stringify(images), displayOrder, isActive ? 1 : 0, id]
    );
    return NextResponse.json({ ok: true });
  });
}

// DELETE /api/admin/events/[id]
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withPermission("content.events", async () => {
    assertSameOrigin(req);
    const { id: idStr } = await params;
    const id = Number(idStr);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: "Invalid id." }, { status: 400 });
    }
    await db.query("DELETE FROM events WHERE id = ?", [id]);
    return NextResponse.json({ ok: true });
  });
}
