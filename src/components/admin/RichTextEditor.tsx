"use client";

import { useEffect, useRef } from "react";

type Cmd =
  | { label: string; title: string; cmd: string; value?: string; node: React.ReactNode }
  | { label: string; title: string; action: "link" | "clear"; node: React.ReactNode };

const ICONS = {
  bold: <span className="font-bold">B</span>,
  italic: <span className="italic">I</span>,
  underline: <span className="underline">U</span>,
  strike: <span className="line-through">S</span>,
  h2: <span className="text-xs font-bold">H2</span>,
  h3: <span className="text-xs font-bold">H3</span>,
  ul: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  ),
  ol: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6h11M10 12h11M10 18h11M4 6h1v4M4 10h2M6 18H4l2-3H4" />
    </svg>
  ),
  link: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 010 5.656l-3 3a4 4 0 01-5.656-5.656l1.5-1.5m6.828-1.828a4 4 0 000-5.656l-3-3a4 4 0 00-5.656 0" />
    </svg>
  ),
  clear: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M9 6v12m6-12v12M5 6l1 14a2 2 0 002 2h8a2 2 0 002-2l1-14" />
    </svg>
  ),
};

const COMMANDS: Cmd[] = [
  { label: "Bold", title: "Bold", cmd: "bold", node: ICONS.bold },
  { label: "Italic", title: "Italic", cmd: "italic", node: ICONS.italic },
  { label: "Underline", title: "Underline", cmd: "underline", node: ICONS.underline },
  { label: "Strikethrough", title: "Strikethrough", cmd: "strikeThrough", node: ICONS.strike },
  { label: "H2", title: "Heading", cmd: "formatBlock", value: "H2", node: ICONS.h2 },
  { label: "H3", title: "Subheading", cmd: "formatBlock", value: "H3", node: ICONS.h3 },
  { label: "Bullet list", title: "Bulleted list", cmd: "insertUnorderedList", node: ICONS.ul },
  { label: "Numbered list", title: "Numbered list", cmd: "insertOrderedList", node: ICONS.ol },
  { label: "Link", title: "Insert link", action: "link", node: ICONS.link },
  { label: "Clear", title: "Clear formatting", action: "clear", node: ICONS.clear },
];

const TEXT_COLORS = [
  "#111827", "#ffffff", "#2563eb", "#eb0028", "#dc2626",
  "#16a34a", "#f59e0b", "#9333ea", "#0891b2", "#6b7280",
];

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Initialize / sync external value only when it differs (avoids caret jumps).
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || "";
    }
  }, [value]);

  function emit() {
    if (ref.current) onChange(ref.current.innerHTML);
  }

  function exec(cmd: string, val?: string) {
    ref.current?.focus();
    // document.execCommand is deprecated but remains the simplest cross-browser
    // way to format contentEditable; output is sanitized server-side.
    document.execCommand(cmd, false, val);
    emit();
  }

  function applyColor(color: string) {
    ref.current?.focus();
    // Emit inline `style="color:…"` (span) instead of legacy <font color>.
    document.execCommand("styleWithCSS", false, "true");
    document.execCommand("foreColor", false, color);
    document.execCommand("styleWithCSS", false, "false");
    emit();
  }

  function run(c: Cmd) {
    if ("cmd" in c) {
      exec(c.cmd, c.value);
      return;
    }
    if (c.action === "link") {
      const url = window.prompt("Enter the URL (https://…):", "https://");
      if (url) exec("createLink", url);
    } else if (c.action === "clear") {
      exec("removeFormat");
      exec("formatBlock", "P");
    }
  }

  return (
    <div className="rounded-lg border border-gray-300 focus-within:border-blue-500">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 p-1.5">
        {COMMANDS.map((c, i) => (
          <span key={c.label} className="flex items-center">
            {(i === 4 || i === 6 || i === 8) && (
              <span className="mx-1 h-5 w-px bg-gray-200" />
            )}
            <button
              type="button"
              title={c.title}
              onMouseDown={(e) => {
                e.preventDefault(); // keep selection
                run(c);
              }}
              className="flex h-8 min-w-8 items-center justify-center rounded-md px-1.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              {c.node}
            </button>
          </span>
        ))}

        {/* Text color */}
        <span className="mx-1 h-5 w-px bg-gray-200" />
        <div className="flex items-center gap-1">
          {TEXT_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              title={`Text color ${color}`}
              onMouseDown={(e) => {
                e.preventDefault();
                applyColor(color);
              }}
              className="h-5 w-5 rounded-full ring-1 ring-gray-300 ring-offset-1 transition-transform hover:scale-110"
              style={{ backgroundColor: color }}
            />
          ))}
          <label
            title="Custom color"
            onMouseDown={(e) => e.preventDefault()}
            className="relative flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-gray-500 hover:bg-gray-100"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 15V5a2 2 0 00-2-2h-4M21 15a4 4 0 01-4 4H7" />
            </svg>
            <input
              type="color"
              defaultValue="#2563eb"
              onChange={(e) => applyColor(e.target.value)}
              className="absolute inset-0 cursor-pointer opacity-0"
              aria-label="Custom text color"
            />
          </label>
        </div>
      </div>

      {/* Editable area */}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        onBlur={emit}
        data-placeholder={placeholder || "Write a description…"}
        className="rte-content min-h-[120px] w-full px-3 py-2 text-sm leading-relaxed text-gray-800 focus:outline-none"
      />
    </div>
  );
}
