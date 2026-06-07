"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export type NavRow = {
  id: number;
  label: string;
  href: string;
  parentId: number | null;
  displayOrder: number;
  isExternal: boolean;
  isActive: boolean;
};

type Draft = {
  id: number | null;
  label: string;
  href: string;
  parentId: number | "";
  displayOrder: number;
  isExternal: boolean;
  isActive: boolean;
};

export default function NavManager({ initialRows }: { initialRows: NavRow[] }) {
  const router = useRouter();
  const [rows, setRows] = useState<NavRow[]>(initialRows);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [dragId, setDragId] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<number | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);

  // Keep local rows in sync after a server refresh.
  useEffect(() => setRows(initialRows), [initialRows]);

  const parentOptions = rows.filter((r) => r.parentId === null);
  const labelById = new Map(rows.map((r) => [r.id, r.label]));

  const topItems = rows
    .filter((r) => r.parentId === null)
    .sort((a, b) => a.displayOrder - b.displayOrder);
  const childrenOf = (id: number) =>
    rows
      .filter((r) => r.parentId === id)
      .sort((a, b) => a.displayOrder - b.displayOrder);

  // ---- Drag & drop reordering (within the same group only) ----
  async function persistOrder(updated: NavRow[]) {
    setSavingOrder(true);
    try {
      await fetch("/api/admin/navigation/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: updated.map((r) => ({
            id: r.id,
            displayOrder: r.displayOrder,
            parentId: r.parentId,
          })),
        }),
      });
      router.refresh();
    } finally {
      setSavingOrder(false);
    }
  }

  function handleDrop(targetId: number) {
    const dragged = rows.find((r) => r.id === dragId);
    const target = rows.find((r) => r.id === targetId);
    setDragId(null);
    setDropTarget(null);
    if (!dragged || !target || dragged.id === target.id) return;
    // Only reorder within the same group (same parent).
    if (dragged.parentId !== target.parentId) return;

    const group = rows
      .filter((r) => r.parentId === dragged.parentId)
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .filter((r) => r.id !== dragged.id);
    const targetIdx = group.findIndex((r) => r.id === target.id);
    group.splice(targetIdx, 0, dragged);

    // Reassign sequential display orders for the group.
    const orderMap = new Map(group.map((r, i) => [r.id, i]));
    const updated = rows.map((r) =>
      orderMap.has(r.id) ? { ...r, displayOrder: orderMap.get(r.id)! } : r
    );
    setRows(updated);
    persistOrder(group.map((r, i) => ({ ...r, displayOrder: i })));
  }

  function startCreate() {
    setError("");
    setDraft({ id: null, label: "", href: "", parentId: "", displayOrder: 0, isExternal: false, isActive: true });
  }
  function startEdit(r: NavRow) {
    setError("");
    setDraft({
      id: r.id,
      label: r.label,
      href: r.href,
      parentId: r.parentId ?? "",
      displayOrder: r.displayOrder,
      isExternal: r.isExternal,
      isActive: r.isActive,
    });
  }

  async function save() {
    if (!draft) return;
    if (!draft.label.trim() || !draft.href.trim()) {
      setError("Label and link are required.");
      return;
    }
    setSaving(true);
    setError("");
    const isEdit = draft.id !== null;
    const payload = {
      label: draft.label,
      href: draft.href,
      parentId: draft.parentId === "" ? null : Number(draft.parentId),
      displayOrder: draft.displayOrder,
      isExternal: draft.isExternal,
      isActive: draft.isActive,
    };
    const res = await fetch(
      isEdit ? `/api/admin/navigation/${draft.id}` : "/api/admin/navigation",
      {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "Save failed.");
      return;
    }
    setDraft(null);
    router.refresh();
  }

  async function remove(r: NavRow) {
    const hasChildren = rows.some((x) => x.parentId === r.id);
    const msg = hasChildren
      ? `Delete "${r.label}" and its sub-pages?`
      : `Delete "${r.label}"?`;
    if (!confirm(msg)) return;
    const res = await fetch(`/api/admin/navigation/${r.id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(data.error || "Delete failed.");
      return;
    }
    router.refresh();
  }

  function Row({ r, child }: { r: NavRow; child?: boolean }) {
    return (
      <div
        draggable
        onDragStart={() => setDragId(r.id)}
        onDragEnd={() => {
          setDragId(null);
          setDropTarget(null);
        }}
        onDragOver={(e) => {
          const dragged = rows.find((x) => x.id === dragId);
          if (dragged && dragged.parentId === r.parentId && dragged.id !== r.id) {
            e.preventDefault();
            setDropTarget(r.id);
          }
        }}
        onDragLeave={() => setDropTarget((t) => (t === r.id ? null : t))}
        onDrop={() => handleDrop(r.id)}
        className={`flex items-center gap-3 rounded-lg border bg-white px-3 py-2.5 transition-colors ${
          dragId === r.id ? "opacity-40" : ""
        } ${dropTarget === r.id ? "border-blue-400 ring-2 ring-blue-100" : "border-gray-200"} ${
          child ? "ml-8" : ""
        }`}
      >
        {/* drag handle */}
        <span className="cursor-grab text-gray-400 active:cursor-grabbing" title="Drag to reorder">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 4a1 1 0 110 2 1 1 0 010-2zm6 0a1 1 0 110 2 1 1 0 010-2zM7 9a1 1 0 110 2 1 1 0 010-2zm6 0a1 1 0 110 2 1 1 0 010-2zM7 14a1 1 0 110 2 1 1 0 010-2zm6 0a1 1 0 110 2 1 1 0 010-2z" />
          </svg>
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-gray-900">
            {child && <span className="text-gray-400">↳ </span>}
            {r.label}
            {!r.isActive && (
              <span className="ml-2 rounded bg-gray-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-gray-500">
                Hidden
              </span>
            )}
          </p>
          <p className="truncate text-xs text-gray-400">{r.href}</p>
        </div>
        <button onClick={() => startEdit(r)} className="text-sm font-medium text-blue-600 hover:underline">
          Edit
        </button>
        <button onClick={() => remove(r)} className="text-sm font-medium text-red-600 hover:underline">
          Delete
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6">
      {!draft && (
        <div className="mb-4 flex items-center gap-3">
          <button
            onClick={startCreate}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + New Menu Item
          </button>
          {savingOrder && <span className="text-sm text-gray-500">Saving order…</span>}
        </div>
      )}

      {draft && (
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">
            {draft.id === null ? "New Menu Item" : "Edit Menu Item"}
          </h2>
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Label *</label>
              <input
                value={draft.label}
                onChange={(e) => setDraft({ ...draft, label: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Link (e.g. /clubs or https://…)
              </label>
              <input
                value={draft.href}
                onChange={(e) => setDraft({ ...draft, href: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Parent (for a sub-page)
              </label>
              <select
                value={draft.parentId}
                onChange={(e) =>
                  setDraft({ ...draft, parentId: e.target.value === "" ? "" : Number(e.target.value) })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="">— Top level (no parent) —</option>
                {parentOptions
                  .filter((p) => p.id !== draft.id)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Display Order</label>
              <input
                type="number"
                value={draft.displayOrder}
                onChange={(e) => setDraft({ ...draft, displayOrder: Number(e.target.value) })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={draft.isExternal}
                onChange={(e) => setDraft({ ...draft, isExternal: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-blue-600"
              />
              Opens in new tab (external link)
            </label>
          </div>
          <div className="mt-6 flex gap-3">
            <button
              onClick={save}
              disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              onClick={() => setDraft(null)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <p className="mb-3 text-xs text-gray-500">
        Drag the <span className="font-medium">⠿</span> handle to reorder items. Top-level
        items and sub-items reorder within their own group. Use <strong>Edit → Parent</strong>{" "}
        to move an item in or out of a dropdown.
      </p>

      <div className="space-y-2">
        {topItems.map((item) => {
          const kids = childrenOf(item.id);
          return (
            <div key={item.id} className="space-y-2">
              <Row r={item} />
              {kids.length > 0 && (
                <div className="space-y-2">
                  {kids.map((k) => (
                    <Row key={k.id} r={k} child />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
