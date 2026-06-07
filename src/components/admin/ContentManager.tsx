"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import RichTextEditor from "@/components/admin/RichTextEditor";
import type { ContentEntity, ContentRow } from "@/lib/content-config";

export type { ContentRow };

export default function ContentManager({
  entity,
  rows,
  canManage,
  dynamicOptions,
}: {
  entity: ContentEntity;
  rows: ContentRow[];
  canManage: boolean;
  dynamicOptions?: Record<string, { value: string; label: string }[]>;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<Record<string, string | boolean> | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Returns the option list for a field: dynamic options override static ones.
  const optionsFor = (fieldName: string) => {
    if (dynamicOptions?.[fieldName]) return dynamicOptions[fieldName];
    return entity.fields.find((f) => f.name === fieldName)?.options ?? [];
  };

  // --- Filters ---
  const [search, setSearch] = useState("");
  const [selectFilters, setSelectFilters] = useState<Record<string, string>>({});

  const selectFields = entity.fields.filter((f) => f.type === "select");

  function labelFor(fieldName: string, value: string): string {
    return optionsFor(fieldName).find((o) => o.value === value)?.label ?? value;
  }

  const filteredRows = rows.filter((row) => {
    // select filters
    for (const [field, value] of Object.entries(selectFilters)) {
      if (value && String(row[field] ?? "") !== value) return false;
    }
    // text search across all field values
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const haystack = entity.fields
        .map((f) => String(row[f.name] ?? ""))
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const hasActiveFilters =
    search.trim() !== "" || Object.values(selectFilters).some((v) => v);

  function clearFilters() {
    setSearch("");
    setSelectFilters({});
  }

  function emptyDraft(): Record<string, string | boolean> {
    const d: Record<string, string | boolean> = {};
    for (const f of entity.fields) d[f.name] = "";
    d.is_active = true;
    return d;
  }

  function startCreate() {
    setError("");
    setEditId(null);
    setDraft(emptyDraft());
  }

  function startEdit(row: ContentRow) {
    setError("");
    setEditId(row.id);
    const d: Record<string, string | boolean> = {};
    for (const f of entity.fields) {
      const v = row[f.name];
      let str = v == null ? "" : String(v);
      // <input type="time"> expects HH:MM — trim DB "HH:MM:SS".
      if (f.type === "time" && str.length >= 5) str = str.slice(0, 5);
      d[f.name] = str;
    }
    d.is_active = row.is_active !== false && row.is_active !== 0;
    setDraft(d);
  }

  async function save() {
    if (!draft) return;
    setError("");
    setSaving(true);
    const isEdit = editId !== null;
    const res = await fetch(
      isEdit
        ? `/api/admin/content/${entity.key}/${editId}`
        : `/api/admin/content/${entity.key}`,
      {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      }
    );
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "Save failed.");
      return;
    }
    setDraft(null);
    setEditId(null);
    router.refresh();
  }

  async function remove(row: ContentRow) {
    const label = String(row[entity.fields[0].name] ?? "this item");
    if (!confirm(`Delete "${label}"?`)) return;
    const res = await fetch(`/api/admin/content/${entity.key}/${row.id}`, {
      method: "DELETE",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(data.error || "Delete failed.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="mt-6">
      {canManage && !draft && (
        <button
          onClick={startCreate}
          className="mb-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + New {entity.singular}
        </button>
      )}

      {draft && (
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">
            {editId === null ? `Create ${entity.singular}` : `Edit ${entity.singular}`}
          </h2>
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            {entity.fields.map((f) => (
              <div
                key={f.name}
                className={f.type === "textarea" || f.type === "richtext" ? "sm:col-span-2" : ""}
              >
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {f.label}
                  {f.required && <span className="text-red-500"> *</span>}
                </label>
                {f.type === "richtext" ? (
                  <RichTextEditor
                    value={String(draft[f.name] ?? "")}
                    onChange={(html) => setDraft({ ...draft, [f.name]: html })}
                    placeholder={`Write the ${f.label.toLowerCase()}…`}
                  />
                ) : f.type === "textarea" ? (
                  <textarea
                    value={String(draft[f.name] ?? "")}
                    onChange={(e) => setDraft({ ...draft, [f.name]: e.target.value })}
                    rows={4}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                ) : f.type === "select" ? (
                  <select
                    value={String(draft[f.name] ?? "")}
                    onChange={(e) => setDraft({ ...draft, [f.name]: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">— Select —</option>
                    {optionsFor(f.name).map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={
                      f.type === "number"
                        ? "number"
                        : f.type === "email"
                        ? "email"
                        : f.type === "time"
                        ? "time"
                        : "text"
                    }
                    value={String(draft[f.name] ?? "")}
                    onChange={(e) => setDraft({ ...draft, [f.name]: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                )}
              </div>
            ))}
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
              onClick={() => {
                setDraft(null);
                setEditId(null);
              }}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filter bar */}
      <div className="mb-4 flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative flex-1 sm:min-w-[200px]">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${entity.title.toLowerCase()}…`}
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        {selectFields.map((f) => (
          <select
            key={f.name}
            value={selectFilters[f.name] ?? ""}
            onChange={(e) =>
              setSelectFilters((prev) => ({ ...prev, [f.name]: e.target.value }))
            }
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="">All {f.label}</option>
            {optionsFor(f.name).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        ))}

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-800"
          >
            Clear
          </button>
        )}

        <span className="text-xs text-gray-400 sm:ml-auto">
          {filteredRows.length} of {rows.length}
        </span>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              {entity.listColumns.map((c) => {
                const f = entity.fields.find((x) => x.name === c);
                return (
                  <th key={c} className="px-4 py-3">{f?.label ?? c}</th>
                );
              })}
              {canManage && <th className="px-4 py-3 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredRows.length === 0 && (
              <tr>
                <td
                  colSpan={entity.listColumns.length + 1}
                  className="px-4 py-8 text-center text-gray-400"
                >
                  {rows.length === 0 ? "No entries yet." : "No matches for these filters."}
                </td>
              </tr>
            )}
            {filteredRows.map((row) => (
              <tr key={row.id}>
                {entity.listColumns.map((c) => {
                  const field = entity.fields.find((x) => x.name === c);
                  const raw = row[c];
                  const display =
                    field?.type === "select" && raw != null
                      ? labelFor(c, String(raw))
                      : String(raw ?? "—");
                  return (
                    <td key={c} className="px-4 py-3 text-gray-700">
                      {display}
                    </td>
                  );
                })}
                {canManage && (
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => startEdit(row)}
                      className="mr-3 text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove(row)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
