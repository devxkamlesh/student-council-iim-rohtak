import { NextResponse } from "next/server";
import { z } from "zod";
import type { RowDataPacket } from "mysql2";
import db from "@/lib/db";
import { withPermission, assertSameOrigin } from "@/lib/api-guard";

export const runtime = "nodejs";

const schema = z.object({
  label: z.string().min(2).max(50).optional(),
  setCurrent: z.boolean().optional(),
});

// PUT /api/admin/batches/[id] — rename and/or make current
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withPermission("content.team", async () => {
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

    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT id FROM council_batches WHERE id = ? LIMIT 1",
      [id]
    );
    if (!rows.length) {
      return NextResponse.json({ error: "Batch not found." }, { status: 404 });
    }

    if (parsed.data.label) {
      await db.query("UPDATE council_batches SET label = ? WHERE id = ?", [
        parsed.data.label,
        id,
      ]);
    }

    // Setting this batch current auto-closes the others.
    if (parsed.data.setCurrent === true) {
      await db.query("UPDATE council_batches SET is_current = FALSE");
      await db.query("UPDATE council_batches SET is_current = TRUE WHERE id = ?", [id]);
    }

    return NextResponse.json({ ok: true });
  });
}

// DELETE /api/admin/batches/[id]
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withPermission("content.team", async () => {
    assertSameOrigin(req);
    const { id: idStr } = await params;
    const id = Number(idStr);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: "Invalid id." }, { status: 400 });
    }

    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT code, is_current FROM council_batches WHERE id = ? LIMIT 1",
      [id]
    );
    const batch = rows[0];
    if (!batch) {
      return NextResponse.json({ error: "Batch not found." }, { status: 404 });
    }
    if (batch.is_current) {
      return NextResponse.json(
        { error: "Set another batch as current before deleting this one." },
        { status: 400 }
      );
    }

    const [members] = await db.query<RowDataPacket[]>(
      "SELECT COUNT(*) AS c FROM team_members WHERE council_batch = ?",
      [batch.code]
    );
    if (Number(members[0].c) > 0) {
      return NextResponse.json(
        { error: "This batch still has team members. Reassign or remove them first." },
        { status: 409 }
      );
    }

    await db.query("DELETE FROM council_batches WHERE id = ?", [id]);
    return NextResponse.json({ ok: true });
  });
}
