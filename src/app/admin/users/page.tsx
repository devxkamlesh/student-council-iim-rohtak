import type { RowDataPacket } from "mysql2";
import db from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import UsersManager, { type UserRow, type RoleOption } from "./UsersManager";

export const dynamic = "force-dynamic";

async function getUsers(): Promise<UserRow[]> {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT u.id, u.name, u.email, u.is_active, u.is_system, u.role_id, u.last_login_at, r.name AS role_name
       FROM users u
       LEFT JOIN roles r ON r.id = u.role_id
      ORDER BY u.is_system DESC, u.created_at DESC`
  );
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    isActive: !!r.is_active,
    isSystem: !!r.is_system,
    roleId: r.role_id ?? null,
    roleName: r.role_name ?? null,
    lastLogin: r.last_login_at ? new Date(r.last_login_at).toLocaleString() : null,
  }));
}

async function getRoleOptions(): Promise<RoleOption[]> {
  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT id, name, description FROM roles ORDER BY name"
  );
  return rows.map((r) => ({ id: r.id, name: r.name, description: r.description ?? "" }));
}

export default async function UsersPage() {
  const user = await requirePermission("users.view");
  const [users, roles] = await Promise.all([getUsers(), getRoleOptions()]);
  const canManage = user.permissions.includes("users.manage");

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Users</h1>
      <p className="mt-1 text-sm text-gray-500">
        Manage admin accounts and assign each user a role.
      </p>
      <UsersManager
        initialUsers={users}
        roles={roles}
        canManage={canManage}
        currentUserId={user.id}
      />
    </div>
  );
}
