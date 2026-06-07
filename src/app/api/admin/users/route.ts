import { NextResponse } from "next/server";
import { z } from "zod";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import db from "@/lib/db";
import { withPermission, assertSameOrigin } from "@/lib/api-guard";
import { hashPassword, isAdministratorRole } from "@/lib/auth";

export const runtime = "nodejs";

const createSchema = z.object({
  name: z.string().min(2).max(255),
  email: z.string().email().max(255),
  password: z.string().min(8).max(200),
  roleId: z.number().int().positive(),
});

// POST /api/admin/users — create a user
export async function POST(req: Request) {
  return withPermission("users.manage", async (currentUser) => {
    assertSameOrigin(req);

    const body = await req.json().catch(() => null);
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input. Password must be at least 8 characters." },
        { status: 400 }
      );
    }
    const { name, roleId } = parsed.data;
    const email = parsed.data.email.toLowerCase().trim();

    const [dupe] = await db.query<RowDataPacket[]>(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email]
    );
    if (dupe.length) {
      return NextResponse.json(
        { error: "A user with this email already exists." },
        { status: 409 }
      );
    }

    const [roleRows] = await db.query<RowDataPacket[]>(
      "SELECT id FROM roles WHERE id = ? LIMIT 1",
      [roleId]
    );
    if (!roleRows.length) {
      return NextResponse.json({ error: "Invalid role." }, { status: 400 });
    }

    // Only a system Administrator may grant the Administrator role.
    if (
      (await isAdministratorRole(roleId)) &&
      currentUser.roleSlug !== "administrator"
    ) {
      return NextResponse.json(
        { error: "Only an Administrator can assign the Administrator role." },
        { status: 403 }
      );
    }

    const hash = await hashPassword(parsed.data.password);
    const [result] = await db.query<ResultSetHeader>(
      "INSERT INTO users (name, email, password_hash, role_id) VALUES (?, ?, ?, ?)",
      [name, email, hash, roleId]
    );
    return NextResponse.json({ ok: true, id: result.insertId }, { status: 201 });
  });
}
