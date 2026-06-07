"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageEditor from "@/components/ImageEditor";

export type GalleryRow = {
  id: number;
  url: string;
  caption: string;
  displayOrder: number;
  isActive: boolean;
  bytes: number;
  format: string;
  width: number;
  height: number;
};

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function prettyBytes(n: number): string {
  if (!n) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

export default function GalleryManager({
  initialImages,
}: {
  initialImages: GalleryRow[];
}) {
  const router = useRouter();
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  // Images waiting to be edited then uploaded (the first one is shown in the editor).
  const [queue, setQueue] = useState<string[]>([]);

  async function onFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError("");
    const valid: string[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        setError(`"${file.name}" is not an image.`);
        continue;
      }
      if (file.size > MAX_BYTES) {
        setError(`"${file.name}" is larger than 10 MB.`);
        continue;
      }
      valid.push(await fileToDataUrl(file));
    }
    if (valid.length) setQueue((q) => [...q, ...valid]);
  }

  // Called by the editor when the user applies (or keeps the original).
  async function uploadEdited(dataUrl: string) {
    setUploading(true);
    try {
      const res = await fetch("/api/admin/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl, caption }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Upload failed.");
        setQueue([]); // stop the batch on error
        return;
      }
      setQueue((q) => q.slice(1)); // advance to the next queued image
      router.refresh();
    } catch {
      setError("Something went wrong while uploading.");
      setQueue([]);
    } finally {
      setUploading(false);
    }
  }

  function skipCurrent() {
    setQueue((q) => q.slice(1));
  }

  async function saveCaption(img: GalleryRow, value: string) {
    await fetch(`/api/admin/gallery/${img.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caption: value }),
    });
    router.refresh();
  }

  async function remove(img: GalleryRow) {
    if (!confirm("Delete this photo? It will also be removed from Cloudinary.")) return;
    const res = await fetch(`/api/admin/gallery/${img.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Delete failed.");
      return;
    }
    router.refresh();
  }

  const [copiedId, setCopiedId] = useState<number | null>(null);
  async function copyLink(img: GalleryRow) {
    try {
      await navigator.clipboard.writeText(img.url);
      setCopiedId(img.id);
      setTimeout(() => setCopiedId((c) => (c === img.id ? null : c)), 1500);
    } catch {
      // Fallback for older browsers / non-secure contexts.
      window.prompt("Copy this image link:", img.url);
    }
  }

  // View (lightbox) + edit an existing image with the image editor.
  const [viewUrl, setViewUrl] = useState<string | null>(null);
  const [editing, setEditing] = useState<GalleryRow | null>(null);

  async function applyEdit(dataUrl: string) {
    const target = editing;
    setEditing(null);
    if (!target) return;
    setUploading(true);
    try {
      const res = await fetch(`/api/admin/gallery/${target.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Update failed.");
        return;
      }
      router.refresh();
    } catch {
      setError("Something went wrong while saving the edit.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mt-6">
      {/* Uploader */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Upload Photos</h2>
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Caption (optional, applied to the photos you upload now)
          </label>
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="e.g. Infusion 2025 — EDM Night"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <label
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 px-6 py-10 text-center transition-colors hover:border-blue-400 hover:bg-blue-50/40 ${
            uploading ? "pointer-events-none opacity-60" : ""
          }`}
        >
          <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.9 5 5 0 019.9-1A4.5 4.5 0 0117 16m-5-4v8m0-8l-3 3m3-3l3 3" />
          </svg>
          <span className="text-sm font-medium text-gray-700">
            {uploading ? "Uploading…" : "Click to choose images — you can crop, rotate & add text before uploading"}
          </span>
          <span className="text-xs text-gray-400">
            JPG, PNG, WebP — up to 10 MB each. You can select multiple files.
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              onFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
      </div>

      {/* Image editor — opens for each queued image before upload */}
      {queue.length > 0 && (
        <ImageEditor
          src={queue[0]}
          title={
            queue.length > 1
              ? `Edit photo (1 of ${queue.length})`
              : "Edit photo before upload"
          }
          onCancel={skipCurrent}
          onApply={uploadEdited}
        />
      )}

      {/* Image editor — opens when editing an existing uploaded photo */}
      {editing && (
        <ImageEditor
          src={editing.url.replace("/upload/", "/upload/f_auto,q_auto/")}
          title="Edit photo"
          onCancel={() => setEditing(null)}
          onApply={applyEdit}
        />
      )}

      {/* Grid */}
      {initialImages.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">
          No photos uploaded yet.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {initialImages.map((img) => (
            <div
              key={img.id}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url.replace("/upload/", "/upload/f_auto,q_auto,w_500/")}
                alt={img.caption || "Gallery photo"}
                onClick={() => setViewUrl(img.url)}
                className="aspect-video w-full cursor-zoom-in object-cover"
              />
              <div className="space-y-2 p-4">
                <input
                  defaultValue={img.caption}
                  onBlur={(e) => {
                    if (e.target.value !== img.caption) saveCaption(img, e.target.value);
                  }}
                  placeholder="Add a caption…"
                  className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                />
                <p className="text-xs text-gray-400">
                  {img.width}×{img.height} · {img.format.toUpperCase()} ·{" "}
                  {prettyBytes(img.bytes)}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1">
                  <button
                    onClick={() => copyLink(img)}
                    className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 010 5.656l-3 3a4 4 0 01-5.656-5.656l1.5-1.5m6.828-1.828a4 4 0 000-5.656l-3-3a4 4 0 00-5.656 0" />
                    </svg>
                    {copiedId === img.id ? "Copied!" : "Copy link"}
                  </button>
                  <a
                    href={img.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:underline"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5h5m0 0v5m0-5L10 14M9 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-3" />
                    </svg>
                    Open
                  </a>
                  <button
                    onClick={() => setEditing(img)}
                    className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:underline"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => remove(img)}
                    className="ml-auto text-sm font-medium text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View lightbox */}
      {viewUrl && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setViewUrl(null)}
        >
          <button
            onClick={() => setViewUrl(null)}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={viewUrl}
            alt="Full size"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] w-auto rounded-lg object-contain"
          />
        </div>
      )}

      {/* Edit an existing gallery image */}
      {editing && (
        <ImageEditor
          src={editing.url}
          title="Edit photo"
          onCancel={() => setEditing(null)}
          onApply={applyEdit}
        />
      )}
    </div>
  );
}
