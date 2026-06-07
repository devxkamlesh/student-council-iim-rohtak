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

// POST /api/admin/navigation — create a nav link (or sub-page)
export async function POST(req: Request) {
  return withPermission("content.navigation", async () => {
    assertSameOrigin(req);
    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    }
    const { label, href, parentId, displayOrder, isExternal, isActive } = parsed.data;

    const [result] = await db.query<ResultSetHeader>(
      "INSERT INTO nav_links (label, href, parent_id, display_order, is_external, is_active) VALUES (?, ?, ?, ?, ?, ?)",
      [label, href, parentId ?? null, displayOrder, isExternal ? 1 : 0, isActive ? 1 : 0]
    );
    return NextResponse.json({ ok: true, id: result.insertId }, { status: 201 });
  });
}
