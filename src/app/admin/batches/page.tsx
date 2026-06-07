import type { RowDataPacket } from "mysql2";
import db from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import BatchesManager, { type BatchRow } from "./BatchesManager";

export const dynamic = "force-dynamic";

async function getBatchRows(): Promise<BatchRow[]> {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT b.id, b.code, b.label, b.is_current,
            (SELECT COUNT(*) FROM team_members t WHERE t.council_batch = b.code) AS member_count
       FROM council_batches b
      ORDER BY b.is_current DESC, b.display_order DESC`
  );
  return rows.map((r) => ({
    id: r.id,
    code: r.code,
    label: r.label,
    isCurrent: !!r.is_current,
    memberCount: Number(r.member_count),
  }));
}

export default async function AdminBatchesPage() {
  await requirePermission("content.team");
  const batches = await getBatchRows();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Council Batches</h1>
      <p className="mt-1 text-sm text-gray-500">
        The <strong>current</strong> batch shows as the open Senior Team on the
        homepage. Older batches appear as collapsed previous councils. Making a
        new batch current automatically closes the others.
      </p>
      <BatchesManager initialBatches={batches} />
    </div>
  );
}
