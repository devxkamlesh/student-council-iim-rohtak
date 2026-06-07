import { NextResponse } from "next/server";
import type { ResultSetHeader } from "mysql2";
import db from "@/lib/db";
import { withPermission, assertSameOrigin } from "@/lib/api-guard";
import { CONTENT } from "@/lib/content-config";
import { sanitizeRichText } from "@/lib/sanitize";

export const runtime = "nodejs";

/** Coerce a raw form value to the right type for its field. */
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

// POST /api/admin/content/[entity] — create a row
export async function POST(
  req: Request,
  { params }: { params: Promise<{ entity: string }> }
) {
  const { entity: entityKey } = await params;
  const entity = CONTENT[entityKey];
  if (!entity) {
    return NextResponse.json({ error: "Unknown content type." }, { status: 404 });
  }

  return withPermission(entity.permission, async () => {
    assertSameOrigin(req);
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

    // Validate required fields.
    for (const f of entity.fields) {
      if (f.required && !String(body[f.name] ?? "").trim()) {
        return NextResponse.json(
          { error: `${f.label} is required.` },
          { status: 400 }
        );
      }
    }

    // Build column/value lists from the whitelist (safe).
    const cols: string[] = [];
    const placeholders: string[] = [];
    const values: (string | number | null)[] = [];
    for (const f of entity.fields) {
      cols.push(f.name);
      placeholders.push("?");
      values.push(coerce(f.type, body[f.name]));
    }
    cols.push("is_active");
    placeholders.push("?");
    values.push(body.is_active === false ? 0 : 1);

    const sql = `INSERT INTO \`${entity.table}\` (${cols
      .map((c) => `\`${c}\``)
      .join(", ")}) VALUES (${placeholders.join(", ")})`;
    const [result] = await db.query<ResultSetHeader>(sql, values);

    return NextResponse.json({ ok: true, id: result.insertId }, { status: 201 });
  });
}
