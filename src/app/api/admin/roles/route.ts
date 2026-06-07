import { NextResponse } from "next/server";
import { z } from "zod";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import db from "@/lib/db";
import { withPermission, assertSameOrigin } from "@/lib/api-guard";

export const runtime = "nodejs";

const createSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(255).optional().default(""),
  permissions: z.array(z.string().max(100)).default([]),
});

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

// POST /api/admin/roles — create a role
export async function POST(req: Request) {
  return withPermission("roles.manage", async () => {
    assertSameOrigin(req);

    const body = await req.json().catch(() => null);
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    }
    const { name, description, permissions } = parsed.data;
    const slug = slugify(name);
    if (!slug) {
      return NextResponse.json({ error: "Invalid role name." }, { status: 400 });
    }

    const [existing] = await db.query<RowDataPacket[]>(
      "SELECT id FROM roles WHERE slug = ? LIMIT 1",
      [slug]
    );
    if (existing.length) {
      return NextResponse.json(
        { error: "A role with this name already exists." },
        { status: 409 }
      );
    }

    const [result] = await db.query<ResultSetHeader>(
      "INSERT INTO roles (name, slug, description, is_system) VALUES (?, ?, ?, FALSE)",
      [name, slug, description]
    );
    const roleId = result.insertId;

    if (permissions.length) {
      const [permRows] = await db.query<RowDataPacket[]>(
        "SELECT id FROM permissions WHERE perm_key IN (?)",
        [permissions]
      );
      for (const p of permRows) {
        await db.query(
          "INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)",
          [roleId, p.id]
        );
      }
    }

    return NextResponse.json({ ok: true, id: roleId }, { status: 201 });
  });
}
