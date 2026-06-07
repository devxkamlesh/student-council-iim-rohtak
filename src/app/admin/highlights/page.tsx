import { requirePermission } from "@/lib/auth";
import { CONTENT } from "@/lib/content-config";
import { loadRows } from "@/lib/admin-load";
import ContentManager from "@/components/admin/ContentManager";

export const dynamic = "force-dynamic";

export default async function AdminHighlightsPage() {
  const entity = CONTENT.highlights;
  await requirePermission(entity.permission);
  const rows = await loadRows(entity.key);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Homepage &quot;What We Do&quot; Cards</h1>
      <p className="mt-1 text-sm text-gray-500">
        The four cards shown in the &quot;What We Do&quot; section on the homepage.
      </p>
      <ContentManager entity={entity} rows={rows} canManage />
    </div>
  );
}
