"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import RichTextEditor from "@/components/admin/RichTextEditor";

export type EventRow = {
  id: number;
  name: string;
  description: string;
  images: string[];
  displayOrder: number;
  isActive: boolean;
};

type Draft = {
  id: number | null;
  name: string;
  description: string;
  images: string[];
  displayOrder: number;
  isActive: boolean;
};

export default function EventsManager({
  initialEvents,
}: {
  initialEvents: EventRow[];
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function startCreate() {
    setError("");
    setDraft({ id: null, name: "", description: "", images: [""], displayOrder: 0, isActive: true });
  }
  function startEdit(e: EventRow) {
    setError("");
    setDraft({
      id: e.id,
      name: e.name,
      description: e.description,
      images: e.images.length ? [...e.images] : [""],
      displayOrder: e.displayOrder,
      isActive: e.isActive,
    });
  }

  function setImage(i: number, val: string) {
    if (!draft) return;
    const images = [...draft.images];
    images[i] = val;
    setDraft({ ...draft, images });
  }
  function addImage() {
    if (!draft) return;
    setDraft({ ...draft, images: [...draft.images, ""] });
  }
  function removeImage(i: number) {
    if (!draft) return;
    setDraft({ ...draft, images: draft.images.filter((_, idx) => idx !== i) });
  }

  async function save() {
    if (!draft) return;
    setError("");
    setSaving(true);
    const images = draft.images.map((s) => s.trim()).filter(Boolean);
    const isEdit = draft.id !== null;
    const res = await fetch(
      isEdit ? `/api/admin/events/${draft.id}` : "/api/admin/events",
      {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: draft.name,
          description: draft.description,
          images,
          displayOrder: draft.displayOrder,
          isActive: draft.isActive,
        }),
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

  async function remove(e: EventRow) {
    if (!confirm(`Delete event "${e.name}"?`)) return;
    const res = await fetch(`/api/admin/events/${e.id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(data.error || "Delete failed.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="mt-6">
      {!draft && (
        <button
          onClick={startCreate}
          className="mb-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + New Event
        </button>
      )}

      {draft && (
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">
            {draft.id === null ? "Create Event" : "Edit Event"}
          </h2>
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Name *</label>
              <input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
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

          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
            <RichTextEditor
              value={draft.description}
              onChange={(html) => setDraft({ ...draft, description: html })}
              placeholder="Write the event description…"
            />
          </div>

          {/* Gallery images */}
          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Gallery Image URLs
            </label>
            <div className="space-y-2">
              {draft.images.map((img, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={img}
                    onChange={(e) => setImage(i, e.target.value)}
                    placeholder="https://…/photo.jpg"
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="rounded-lg border border-gray-300 px-3 text-sm text-gray-600 hover:bg-gray-50"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addImage}
              className="mt-2 text-sm font-medium text-blue-600 hover:underline"
            >
              + Add image
            </button>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={save}
              disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save Event"}
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
              <th className="px-4 py-3">Event</th>
              <th className="px-4 py-3">Photos</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {initialEvents.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-gray-400">
                  No events yet.
                </td>
              </tr>
            )}
            {initialEvents.map((e) => (
              <tr key={e.id}>
                <td className="px-4 py-3 font-medium text-gray-900">{e.name}</td>
                <td className="px-4 py-3 text-gray-600">{e.images.length}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => startEdit(e)} className="mr-3 text-blue-600 hover:underline">
                    Edit
                  </button>
                  <button onClick={() => remove(e)} className="text-red-600 hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
