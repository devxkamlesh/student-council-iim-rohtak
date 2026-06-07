import { NextResponse } from "next/server";
import { z } from "zod";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import db from "@/lib/db";
import { withPermission, assertSameOrigin } from "@/lib/api-guard";

export const runtime = "nodejs";

const updateSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(255).optional().default(""),
  permissions: z.array(z.string().max(100)).default([]),
});

async function getRole(id: number) {
  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT id, slug, is_system FROM roles WHERE id = ? LIMIT 1",
    [id]
  );
  return rows[0];
}

// PUT /api/admin/roles/[id] — update name/description/permissions
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withPermission("roles.manage", async (currentUser) => {
    assertSameOrigin(req);
    const { id: idStr } = await params;
    const id = Number(idStr);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: "Invalid id." }, { status: 400 });
    }

    const role = await getRole(id);
    if (!role) {
      return NextResponse.json({ error: "Role not found." }, { status: 404 });
    }

    // System roles (e.g. Administrator) are locked — cannot be edited at all.
    if (role.is_system) {
      return NextResponse.json(
        { error: "System roles cannot be edited." },
        { status: 403 }
      );
    }

    // Users cannot edit their OWN role (privilege escalation prevention).
    if (currentUser.roleSlug === role.slug) {
      return NextResponse.json(
        { error: "You cannot edit the role you are currently assigned to." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => null);
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    }
    const { name, description, permissions } = parsed.data;

    await db.query<ResultSetHeader>(
      "UPDATE roles SET name = ?, description = ? WHERE id = ?",
      [name, description, id]
    );

    // Reset permissions
    await db.query("DELETE FROM role_permissions WHERE role_id = ?", [id]);
    if (permissions.length) {
      const [permRows] = await db.query<RowDataPacket[]>(
        "SELECT id FROM permissions WHERE perm_key IN (?)",
        [permissions]
      );
      for (const p of permRows) {
        await db.query(
          "INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)",
          [id, p.id]
        );
      }
    }

    return NextResponse.json({ ok: true });
  });
}

// DELETE /api/admin/roles/[id]
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withPermission("roles.manage", async (currentUser) => {
    assertSameOrigin(req);
    const { id: idStr } = await params;
    const id = Number(idStr);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: "Invalid id." }, { status: 400 });
    }

    const role = await getRole(id);
    if (!role) {
      return NextResponse.json({ error: "Role not found." }, { status: 404 });
    }
    if (role.is_system) {
      return NextResponse.json(
        { error: "System roles cannot be deleted." },
        { status: 400 }
      );
    }
    if (currentUser.roleSlug === role.slug) {
      return NextResponse.json(
        { error: "You cannot delete the role you are currently assigned to." },
        { status: 403 }
      );
    }

    const [users] = await db.query<RowDataPacket[]>(
      "SELECT COUNT(*) AS c FROM users WHERE role_id = ?",
      [id]
    );
    if (Number(users[0].c) > 0) {
      return NextResponse.json(
        { error: "Reassign users before deleting this role." },
        { status: 409 }
      );
    }

    await db.query("DELETE FROM roles WHERE id = ?", [id]);
    return NextResponse.json({ ok: true });
  });
}
