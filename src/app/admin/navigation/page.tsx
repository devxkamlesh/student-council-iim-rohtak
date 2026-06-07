import type { RowDataPacket } from "mysql2";
import db from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import NavManager, { type NavRow } from "./NavManager";

export const dynamic = "force-dynamic";

async function getNavRows(): Promise<NavRow[]> {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT id, label, href, parent_id, display_order, is_external, is_active
       FROM nav_links
      ORDER BY display_order, id`
  );
  return rows.map((r) => ({
    id: r.id,
    label: r.label,
    href: r.href,
    parentId: r.parent_id ?? null,
    displayOrder: Number(r.display_order ?? 0),
    isExternal: !!r.is_external,
    isActive: !!r.is_active,
  }));
}

export default async function AdminNavigationPage() {
  await requirePermission("content.navigation");
  const rows = await getNavRows();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Navigation Menu</h1>
      <p className="mt-1 text-sm text-gray-500">
        Manage the site menu. Set a <strong>Parent</strong> to turn an item into a
        sub-page (it appears in a dropdown under its parent).
      </p>
      <NavManager initialRows={rows} />
    </div>
  );
}
