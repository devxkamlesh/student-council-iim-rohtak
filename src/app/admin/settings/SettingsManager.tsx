"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageEditor from "@/components/ImageEditor";

type Settings = {
  logoUrl: string;
  heroBannerUrl: string;
  footerLogoUrl: string;
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

function ImageField({
  label,
  hint,
  value,
  rounded,
  editorAspect,
  onChange,
  onError,
}: {
  label: string;
  hint: string;
  value: string;
  rounded?: boolean;
  editorAspect?: number;
  onChange: (url: string) => void;
  onError: (msg: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [editingSrc, setEditingSrc] = useState<string | null>(null);

  async function onFile(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return onError(`"${file.name}" is not an image.`);
    if (file.size > MAX_BYTES) return onError(`"${file.name}" is larger than 10 MB.`);
    onError("");
    // Open the editor first; upload happens after the user applies.
    const dataUrl = await fileToDataUrl(file);
    setEditingSrc(dataUrl);
  }

  async function uploadDataUrl(dataUrl: string) {
    setEditingSrc(null);
    setUploading(true);
    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        onError(data.error || "Upload failed.");
        return;
      }
      onChange(data.url);
      onError("");
    } catch {
      onError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <label className="block text-sm font-semibold text-gray-800">{label}</label>
      <p className="mt-0.5 text-xs text-gray-500">{hint}</p>

      <div className="mt-4 flex items-center gap-4">
        {/* Preview */}
        <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt={`${label} preview`}
              className={`h-full w-full object-contain ${rounded ? "rounded-full" : ""}`}
            />
          ) : (
            <span className="text-xs text-gray-400">No image</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://…/image.png"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <div className="mt-2 flex items-center gap-3">
            <label
              className={`cursor-pointer rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 ${
                uploading ? "pointer-events-none opacity-60" : ""
              }`}
            >
              {uploading ? "Uploading…" : "Upload & edit"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  onFile(e.target.files?.[0] ?? null);
                  e.target.value = "";
                }}
              />
            </label>
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="text-sm text-gray-500 hover:text-red-600"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {editingSrc && (
        <ImageEditor
          src={editingSrc}
          title={`Edit — ${label}`}
          initialAspect={editorAspect}
          onCancel={() => setEditingSrc(null)}
          onApply={uploadDataUrl}
        />
      )}
    </div>
  );
}

export default function SettingsManager({ initial }: { initial: Settings }) {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings>(initial);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function update(patch: Partial<Settings>) {
    setSettings((s) => ({ ...s, ...patch }));
    setSaved(false);
  }

  async function save() {
    setError("");
    setSaving(true);
    const res = await fetch("/api/admin/site-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        logo_url: settings.logoUrl,
        hero_banner_url: settings.heroBannerUrl,
        footer_logo_url: settings.footerLogoUrl,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "Save failed.");
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <div className="mt-6 space-y-5">
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
      )}

      <ImageField
        label="Site Logo"
        hint="Shown in the navbar and the homepage hero. A square, transparent PNG/WebP works best."
        value={settings.logoUrl}
        rounded
        editorAspect={1}
        onChange={(url) => update({ logoUrl: url })}
        onError={setError}
      />

      <ImageField
        label="Hero Banner Image"
        hint="The wide campus image shown below the homepage hero."
        value={settings.heroBannerUrl}
        editorAspect={16 / 9}
        onChange={(url) => update({ heroBannerUrl: url })}
        onError={setError}
      />

      <ImageField
        label="Footer Logo"
        hint="Logo shown in the footer. Leave empty to reuse the site logo."
        value={settings.footerLogoUrl}
        rounded
        editorAspect={1}
        onChange={(url) => update({ footerLogoUrl: url })}
        onError={setError}
      />

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save Settings"}
        </button>
        {saved && <span className="text-sm font-medium text-green-600">Saved!</span>}
      </div>
    </div>
  );
}
