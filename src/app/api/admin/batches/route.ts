import { NextResponse } from "next/server";
import { z } from "zod";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import db from "@/lib/db";
import { withPermission, assertSameOrigin } from "@/lib/api-guard";

export const runtime = "nodejs";

const schema = z.object({
  code: z.string().min(2).max(20),
  label: z.string().min(2).max(50),
  setCurrent: z.boolean().optional().default(true),
});

// POST /api/admin/batches — create a batch (optionally make it current)
export async function POST(req: Request) {
  return withPermission("content.team", async () => {
    assertSameOrigin(req);

    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    }
    const code = parsed.data.code.trim().toUpperCase().replace(/\s+/g, "");
    const { label, setCurrent } = parsed.data;

    const [dupe] = await db.query<RowDataPacket[]>(
      "SELECT id FROM council_batches WHERE code = ? LIMIT 1",
      [code]
    );
    if (dupe.length) {
      return NextResponse.json(
        { error: "A batch with this code already exists." },
        { status: 409 }
      );
    }

    // New batch sorts on top.
    const [maxRow] = await db.query<RowDataPacket[]>(
      "SELECT COALESCE(MAX(display_order), 0) + 1 AS next FROM council_batches"
    );
    const order = Number(maxRow[0].next);

    // Making this the current batch auto-closes all others.
    if (setCurrent) {
      await db.query("UPDATE council_batches SET is_current = FALSE");
    }

    const [result] = await db.query<ResultSetHeader>(
      "INSERT INTO council_batches (code, label, display_order, is_current) VALUES (?, ?, ?, ?)",
      [code, label, order, setCurrent ? 1 : 0]
    );

    return NextResponse.json({ ok: true, id: result.insertId }, { status: 201 });
  });
}
