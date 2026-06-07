"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type UserRow = {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
  isSystem: boolean;
  roleId: number | null;
  roleName: string | null;
  lastLogin: string | null;
};

export type RoleOption = { id: number; name: string; description?: string };

type Draft = {
  id: number | null;
  name: string;
  email: string;
  password: string;
  roleId: number | "";
  isActive: boolean;
};

export default function UsersManager({
  initialUsers,
  roles,
  canManage,
  currentUserId,
}: {
  initialUsers: UserRow[];
  roles: RoleOption[];
  canManage: boolean;
  currentUserId: number;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function startCreate() {
    setError("");
    // Default new users to the least-privileged "Member" role, not the first
    // role alphabetically (which would be Administrator).
    const defaultRole =
      roles.find((r) => r.name.toLowerCase() === "member")?.id ?? roles[0]?.id ?? "";
    setDraft({ id: null, name: "", email: "", password: "", roleId: defaultRole, isActive: true });
  }
  function startEdit(u: UserRow) {
    setError("");
    setDraft({
      id: u.id,
      name: u.name,
      email: u.email,
      password: "",
      roleId: u.roleId ?? "",
      isActive: u.isActive,
    });
  }

  async function save() {
    if (!draft) return;
    setError("");
    if (draft.roleId === "") {
      setError("Please select a role.");
      return;
    }
    setSaving(true);
    const isEdit = draft.id !== null;
    const payload = isEdit
      ? {
          name: draft.name,
          email: draft.email,
          roleId: Number(draft.roleId),
          isActive: draft.isActive,
          password: draft.password || undefined,
        }
      : {
          name: draft.name,
          email: draft.email,
          password: draft.password,
          roleId: Number(draft.roleId),
        };
    const res = await fetch(
      isEdit ? `/api/admin/users/${draft.id}` : "/api/admin/users",
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

  async function remove(u: UserRow) {
    if (!confirm(`Delete user "${u.name}"?`)) return;
    const res = await fetch(`/api/admin/users/${u.id}`, { method: "DELETE" });
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
          + New User
        </button>
      )}

      {draft && (
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">
            {draft.id === null ? "Create User" : "Edit User"}
          </h2>
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
              <input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={draft.email}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {draft.id === null ? "Password" : "New Password (leave blank to keep)"}
              </label>
              <input
                type="password"
                autoComplete="new-password"
                value={draft.password}
                onChange={(e) => setDraft({ ...draft, password: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                placeholder="Min 8 characters"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Role</label>
              <select
                value={draft.roleId}
                onChange={(e) => setDraft({ ...draft, roleId: Number(e.target.value) })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
              {(() => {
                const sel = roles.find((r) => r.id === Number(draft.roleId));
                return sel?.description ? (
                  <p className="mt-1.5 flex items-start gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-xs leading-relaxed text-blue-800 ring-1 ring-blue-100">
                    <svg className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{sel.description}</span>
                  </p>
                ) : null;
              })()}
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={save}
              disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save User"}
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

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Last Login</th>
              {canManage && <th className="px-4 py-3 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {initialUsers.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">
                    {u.name}
                    {u.isSystem && (
                      <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-700">
                        System
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">{u.email}</div>
                </td>
                <td className="px-4 py-3 text-gray-600">{u.roleName ?? "—"}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{u.lastLogin ?? "Never"}</td>
                {canManage && (
                  <td className="px-4 py-3 text-right">
                    {u.isSystem ? (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Locked
                      </span>
                    ) : (
                      <>
                        <button onClick={() => startEdit(u)} className="mr-3 text-blue-600 hover:underline">
                          Edit
                        </button>
                        {u.id !== currentUserId && (
                          <button onClick={() => remove(u)} className="text-red-600 hover:underline">
                            Delete
                          </button>
                        )}
                      </>
                    )}
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
