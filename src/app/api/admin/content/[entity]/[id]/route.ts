import { NextResponse } from "next/server";
import type { ResultSetHeader } from "mysql2";
import db from "@/lib/db";
import { withPermission, assertSameOrigin } from "@/lib/api-guard";
import { CONTENT } from "@/lib/content-config";
import { sanitizeRichText } from "@/lib/sanitize";

export const runtime = "nodejs";

function coerce(type: string, raw: unknown): string | number | null {
  if (type === "number") {
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  }
  if (type === "richtext") {
    const html = typeof raw === "string" ? sanitizeRichText(raw) : "";
    return html === "" ? null : html;
  }
  const s = typeof raw === "string" ? raw.trim() : raw == null ? "" : String(raw);
  return s === "" ? null : s;
}

// PUT /api/admin/content/[entity]/[id] — update a row
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ entity: string; id: string }> }
) {
  const { entity: entityKey, id: idStr } = await params;
  const entity = CONTENT[entityKey];
  if (!entity) {
    return NextResponse.json({ error: "Unknown content type." }, { status: 404 });
  }

  return withPermission(entity.permission, async () => {
    assertSameOrigin(req);
    const id = Number(idStr);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: "Invalid id." }, { status: 400 });
    }

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    for (const f of entity.fields) {
      if (f.required && !String(body[f.name] ?? "").trim()) {
        return NextResponse.json({ error: `${f.label} is required.` }, { status: 400 });
      }
    }

    const sets: string[] = [];
    const values: (string | number | null)[] = [];
    for (const f of entity.fields) {
      sets.push(`\`${f.name}\` = ?`);
      values.push(coerce(f.type, body[f.name]));
    }
    sets.push("`is_active` = ?");
    values.push(body.is_active === false ? 0 : 1);
    values.push(id);

    const sql = `UPDATE \`${entity.table}\` SET ${sets.join(", ")} WHERE id = ?`;
    await db.query<ResultSetHeader>(sql, values);

    return NextResponse.json({ ok: true });
  });
}

// DELETE /api/admin/content/[entity]/[id]
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ entity: string; id: string }> }
) {
  const { entity: entityKey, id: idStr } = await params;
  const entity = CONTENT[entityKey];
  if (!entity) {
    return NextResponse.json({ error: "Unknown content type." }, { status: 404 });
  }

  return withPermission(entity.permission, async () => {
    assertSameOrigin(req);
    const id = Number(idStr);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: "Invalid id." }, { status: 400 });
    }
    await db.query(`DELETE FROM \`${entity.table}\` WHERE id = ?`, [id]);
    return NextResponse.json({ ok: true });
  });
}
