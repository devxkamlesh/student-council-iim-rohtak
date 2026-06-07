"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type BatchRow = {
  id: number;
  code: string;
  label: string;
  isCurrent: boolean;
  memberCount: number;
};

export default function BatchesManager({
  initialBatches,
}: {
  initialBatches: BatchRow[];
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [code, setCode] = useState("");
  const [label, setLabel] = useState("");
  const [setCurrent, setSetCurrent] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function create() {
    setError("");
    if (!code.trim() || !label.trim()) {
      setError("Both code and label are required.");
      return;
    }
    setBusy(true);
    const res = await fetch("/api/admin/batches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, label, setCurrent }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Create failed.");
      return;
    }
    setCreating(false);
    setCode("");
    setLabel("");
    setSetCurrent(true);
    router.refresh();
  }

  async function makeCurrent(b: BatchRow) {
    const res = await fetch(`/api/admin/batches/${b.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ setCurrent: true }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Update failed.");
      return;
    }
    router.refresh();
  }

  async function remove(b: BatchRow) {
    if (!confirm(`Delete batch "${b.label}"?`)) return;
    const res = await fetch(`/api/admin/batches/${b.id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(data.error || "Delete failed.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="mt-6">
      {!creating && (
        <button
          onClick={() => setCreating(true)}
          className="mb-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + New Batch
        </button>
      )}

      {creating && (
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Create Batch</h2>
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Code <span className="text-gray-400">(internal, e.g. SC17)</span>
              </label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="SC17"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Label <span className="text-gray-400">(shown on site, e.g. SC&apos;17)</span>
              </label>
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="SC'17"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
          <label className="mt-4 flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={setCurrent}
              onChange={(e) => setSetCurrent(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600"
            />
            Make this the current batch (auto-closes all others)
          </label>
          <div className="mt-6 flex gap-3">
            <button
              onClick={create}
              disabled={busy}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {busy ? "Saving…" : "Create Batch"}
            </button>
            <button
              onClick={() => setCreating(false)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Batch</th>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Members</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {initialBatches.map((b) => (
              <tr key={b.id}>
                <td className="px-4 py-3 font-medium text-gray-900">{b.label}</td>
                <td className="px-4 py-3 text-gray-500">{b.code}</td>
                <td className="px-4 py-3 text-gray-600">{b.memberCount}</td>
                <td className="px-4 py-3">
                  {b.isCurrent ? (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                      Current (Open)
                    </span>
                  ) : (
                    <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600">
                      Previous (Closed)
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {!b.isCurrent && (
                    <>
                      <button
                        onClick={() => makeCurrent(b)}
                        className="mr-3 text-blue-600 hover:underline"
                      >
                        Make Current
                      </button>
                      <button
                        onClick={() => remove(b)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
