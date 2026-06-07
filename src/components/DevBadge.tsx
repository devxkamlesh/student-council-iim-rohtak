"use client";

import { ATTRIBUTION } from "@/lib/attribution";

export default function DevBadge() {
  return (
    <a
      href={ATTRIBUTION.url}
      target="_blank"
      rel="noopener"
      title={`Designed & Developed by ${ATTRIBUTION.name} — Full Stack Developer`}
      className="inline-flex items-center gap-1.5 text-gray-400 transition-colors hover:text-white"
    >
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
      Designed &amp; Developed by{" "}
      <span className="font-semibold text-white">{ATTRIBUTION.handle.replace("@", "")}</span>
    </a>
  );
}
