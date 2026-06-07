import { NextResponse } from "next/server";
import { z } from "zod";
import type { ResultSetHeader } from "mysql2";
import db from "@/lib/db";
import { withPermission, assertSameOrigin } from "@/lib/api-guard";

export const runtime = "nodejs";

const schema = z.object({
  items: z
    .array(
      z.object({
        id: z.number().int().positive(),
        displayOrder: z.number().int(),
        parentId: z.number().int().positive().nullable(),
      })
    )
    .max(200),
});

// PUT /api/admin/navigation/reorder — persist new order (and parent) for items.
export async function PUT(req: Request) {
  return withPermission("content.navigation", async () => {
    assertSameOrigin(req);
    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    }
    for (const it of parsed.data.items) {
      await db.query<ResultSetHeader>(
        "UPDATE nav_links SET display_order = ?, parent_id = ? WHERE id = ?",
        [it.displayOrder, it.parentId, it.id]
      );
    }
    return NextResponse.json({ ok: true });
  });
}
