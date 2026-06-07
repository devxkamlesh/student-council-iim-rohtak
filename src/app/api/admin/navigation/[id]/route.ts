import { NextResponse } from "next/server";
import { z } from "zod";
import type { ResultSetHeader } from "mysql2";
import db from "@/lib/db";
import { withPermission, assertSameOrigin } from "@/lib/api-guard";

export const runtime = "nodejs";

const schema = z.object({
  label: z.string().min(1).max(100),
  href: z.string().min(1).max(255),
  parentId: z.number().int().positive().nullable().optional(),
  displayOrder: z.number().int().optional().default(0),
  isExternal: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
});

// PUT /api/admin/navigation/[id]
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withPermission("content.navigation", async () => {
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
    const { label, href, parentId, displayOrder, isExternal, isActive } = parsed.data;

    // A link cannot be its own parent.
    const safeParent = parentId === id ? null : parentId ?? null;

    await db.query<ResultSetHeader>(
      "UPDATE nav_links SET label = ?, href = ?, parent_id = ?, display_order = ?, is_external = ?, is_active = ? WHERE id = ?",
      [label, href, safeParent, displayOrder, isExternal ? 1 : 0, isActive ? 1 : 0, id]
    );
    return NextResponse.json({ ok: true });
  });
}

// DELETE /api/admin/navigation/[id]  (sub-pages cascade-delete via FK)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withPermission("content.navigation", async () => {
    assertSameOrigin(req);
    const { id: idStr } = await params;
    const id = Number(idStr);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: "Invalid id." }, { status: 400 });
    }
    await db.query("DELETE FROM nav_links WHERE id = ?", [id]);
    return NextResponse.json({ ok: true });
  });
}
