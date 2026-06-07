import { requirePermission } from "@/lib/auth";
import { CONTENT } from "@/lib/content-config";
import { loadRows } from "@/lib/admin-load";
import ContentManager from "@/components/admin/ContentManager";

export const dynamic = "force-dynamic";

export default async function AdminLeavePage() {
  // Both shuttle and other timings share the content.leave permission.
  await requirePermission("content.leave");
  const [shuttleRows, otherRows] = await Promise.all([
    loadRows("shuttle"),
    loadRows("other_timings"),
  ]);

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Shuttle Timings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Bus timings shown on the Leave &amp; Others page.
        </p>
        <ContentManager entity={CONTENT.shuttle} rows={shuttleRows} canManage />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900">Other Timings</h2>
        <p className="mt-1 text-sm text-gray-500">
          Parcel room, doctor, and other service timings.
        </p>
        <ContentManager entity={CONTENT.other_timings} rows={otherRows} canManage />
      </div>
    </div>
  );
}
