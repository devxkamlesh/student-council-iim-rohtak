import { requirePermission } from "@/lib/auth";
import { CONTENT } from "@/lib/content-config";
import { loadRows } from "@/lib/admin-load";
import ContentManager from "@/components/admin/ContentManager";

export const dynamic = "force-dynamic";

export default async function AdminCommitteesPage() {
  const entity = CONTENT.committees;
  await requirePermission(entity.permission);
  const rows = await loadRows(entity.key);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">{entity.title}</h1>
      <p className="mt-1 text-sm text-gray-500">
        Add, edit, or remove committees shown on the website.
      </p>
      <ContentManager entity={entity} rows={rows} canManage />
    </div>
  );
}
