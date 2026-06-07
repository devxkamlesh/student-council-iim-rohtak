import Link from "next/link";
import { requirePermission } from "@/lib/auth";
import { getBatches } from "@/lib/queries";
import { CONTENT } from "@/lib/content-config";
import { loadRows } from "@/lib/admin-load";
import ContentManager from "@/components/admin/ContentManager";

export const dynamic = "force-dynamic";

export default async function AdminTeamPage() {
  const entity = CONTENT.team;
  await requirePermission(entity.permission);
  const [rows, batches] = await Promise.all([loadRows(entity.key), getBatches()]);

  // Batch dropdown options come from the council_batches table (current first).
  const batchOptions = batches.map((b) => ({
    value: b.code,
    label: b.isCurrent ? `${b.label} (Current)` : b.label,
  }));

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{entity.title}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Add, edit, or remove Student Council team members.
          </p>
        </div>
        <Link
          href="/admin/batches"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Manage Batches
        </Link>
      </div>
      <ContentManager
        entity={entity}
        rows={rows}
        canManage
        dynamicOptions={{ council_batch: batchOptions }}
      />
    </div>
  );
}
