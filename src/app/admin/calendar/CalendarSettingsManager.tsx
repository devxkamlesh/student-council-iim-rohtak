"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type CalendarSettings = {
  schedulingUrl: string;
  embedSrc: string;
  cotyFormSrc: string;
  acaaFormSrc: string;
};

function UrlField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (url: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <label className="block text-sm font-semibold text-gray-800">{label}</label>
      <p className="mt-0.5 text-xs text-gray-500">{hint}</p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://…"
          className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        {value && (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Open
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5h5m0 0v5m0-5L10 14M9 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-3" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}

export default function CalendarSettingsManager({
  initial,
}: {
  initial: CalendarSettings;
}) {
  const router = useRouter();
  const [settings, setSettings] = useState<CalendarSettings>(initial);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function update(patch: Partial<CalendarSettings>) {
    setSettings((s) => ({ ...s, ...patch }));
    setSaved(false);
  }

  async function save() {
    setError("");
    setSaving(true);
    const res = await fetch("/api/admin/calendar-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scheduling_url: settings.schedulingUrl,
        embed_src: settings.embedSrc,
        coty_form_src: settings.cotyFormSrc,
        acaa_form_src: settings.acaaFormSrc,
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

      <UrlField
        label="Booking / Scheduling URL"
        hint="Google Calendar appointment scheduling link used by the 'Book an event' button."
        value={settings.schedulingUrl}
        onChange={(url) => update({ schedulingUrl: url })}
      />

      <UrlField
        label="Embedded Calendar URL"
        hint="The Google Calendar embed 'src' link shown in the calendar iframe."
        value={settings.embedSrc}
        onChange={(url) => update({ embedSrc: url })}
      />

      <UrlField
        label="COTY Points Form URL"
        hint="Google Form link for Club of the Year points (the embedded viewform link)."
        value={settings.cotyFormSrc}
        onChange={(url) => update({ cotyFormSrc: url })}
      />

      <UrlField
        label="ACAA Points Form URL"
        hint="Google Form link for ACAA points."
        value={settings.acaaFormSrc}
        onChange={(url) => update({ acaaFormSrc: url })}
      />

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save Calendar Settings"}
        </button>
        {saved && <span className="text-sm font-medium text-green-600">Saved!</span>}
      </div>
    </div>
  );
}
