import { NextResponse } from "next/server";
import { z } from "zod";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import db from "@/lib/db";
import { withPermission, assertSameOrigin } from "@/lib/api-guard";
import { hashPassword, requireUser, isAdministratorRole } from "@/lib/auth";

export const runtime = "nodejs";

const updateSchema = z.object({
  name: z.string().min(2).max(255),
  email: z.string().email().max(255),
  roleId: z.number().int().positive(),
  isActive: z.boolean(),
  password: z.string().min(8).max(200).optional().or(z.literal("")),
});

// PUT /api/admin/users/[id]
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withPermission("users.manage", async () => {
    assertSameOrigin(req);
    const current = await requireUser();
    const { id: idStr } = await params;
    const id = Number(idStr);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: "Invalid id." }, { status: 400 });
    }

    const body = await req.json().catch(() => null);
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    }
    const { name, roleId, isActive } = parsed.data;
    const email = parsed.data.email.toLowerCase().trim();
    const password = parsed.data.password;

    // Look up the target. System accounts are locked — DB-only changes.
    const [targetRows] = await db.query<RowDataPacket[]>(
      `SELECT u.is_system, r.slug AS role_slug
         FROM users u LEFT JOIN roles r ON r.id = u.role_id
        WHERE u.id = ? LIMIT 1`,
      [id]
    );
    if (!targetRows.length) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }
    if (targetRows[0].is_system) {
      return NextResponse.json(
        { error: "This is a system account and can only be edited directly in the database." },
        { status: 403 }
      );
    }

    const actorIsAdmin = current.roleSlug === "administrator";

    // Only a system Administrator may modify a user who currently holds the
    // Administrator role (prevents demoting/hijacking admins).
    if (targetRows[0].role_slug === "administrator" && !actorIsAdmin) {
      return NextResponse.json(
        { error: "Only an Administrator can modify an Administrator account." },
        { status: 403 }
      );
    }

    // Only a system Administrator may GRANT the Administrator role.
    if ((await isAdministratorRole(roleId)) && !actorIsAdmin) {
      return NextResponse.json(
        { error: "Only an Administrator can assign the Administrator role." },
        { status: 403 }
      );
    }

    // Prevent self-deactivation (lockout protection).
    if (current.id === id && !isActive) {
      return NextResponse.json(
        { error: "You cannot deactivate your own account." },
        { status: 400 }
      );
    }

    const [dupe] = await db.query<RowDataPacket[]>(
      "SELECT id FROM users WHERE email = ? AND id <> ? LIMIT 1",
      [email, id]
    );
    if (dupe.length) {
      return NextResponse.json(
        { error: "Another user already uses this email." },
        { status: 409 }
      );
    }

    await db.query<ResultSetHeader>(
      "UPDATE users SET name = ?, email = ?, role_id = ?, is_active = ? WHERE id = ?",
      [name, email, roleId, isActive, id]
    );

    if (password) {
      const hash = await hashPassword(password);
      await db.query("UPDATE users SET password_hash = ? WHERE id = ?", [hash, id]);
      // Invalidate existing sessions when password changes.
      await db.query("DELETE FROM sessions WHERE user_id = ?", [id]);
    }

    return NextResponse.json({ ok: true });
  });
}

// DELETE /api/admin/users/[id]
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withPermission("users.manage", async () => {
    assertSameOrigin(req);
    const current = await requireUser();
    const { id: idStr } = await params;
    const id = Number(idStr);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: "Invalid id." }, { status: 400 });
    }

    if (current.id === id) {
      return NextResponse.json(
        { error: "You cannot delete your own account." },
        { status: 400 }
      );
    }

    // System accounts cannot be deleted from the UI/API.
    const [targetRows] = await db.query<RowDataPacket[]>(
      "SELECT is_system FROM users WHERE id = ? LIMIT 1",
      [id]
    );
    if (!targetRows.length) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }
    if (targetRows[0].is_system) {
      return NextResponse.json(
        { error: "This is a system account and cannot be deleted." },
        { status: 403 }
      );
    }

    await db.query("DELETE FROM users WHERE id = ?", [id]);
    return NextResponse.json({ ok: true });
  });
}
