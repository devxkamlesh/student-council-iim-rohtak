"use client";

import { useMemo, useState } from "react";

const WEEKDAY_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function TimetableTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  const [query, setQuery] = useState("");
  const [day, setDay] = useState("");
  const [section, setSection] = useState("");

  // Weekday is the part of the Date label before the comma.
  const dayOf = (label: string) => (label.split(",")[0] || "").trim();

  const days = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => {
      const d = dayOf(r[0] ?? "");
      if (d) set.add(d);
    });
    return WEEKDAY_ORDER.filter((d) => set.has(d));
  }, [rows]);

  const sections = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => r[1] && set.add(r[1]));
    return Array.from(set).sort();
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (day && dayOf(r[0] ?? "") !== day) return false;
      if (section && r[1] !== section) return false;
      if (q) {
        const hay = r.join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rows, query, day, section]);

  const hasFilters = query || day || section;

  return (
    <div>
      {/* Filters */}
      <div className="mb-3 flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-2.5 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative flex-1 sm:min-w-[200px]">
          <svg
            className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search course, faculty, date…"
            className="w-full rounded-lg border border-gray-300 py-1.5 pl-8 pr-2 text-xs focus:border-blue-500 focus:outline-none"
          />
        </div>

        <select
          value={day}
          onChange={(e) => setDay(e.target.value)}
          className="rounded-lg border border-gray-300 px-2 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
        >
          <option value="">All Days</option>
          {days.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <select
          value={section}
          onChange={(e) => setSection(e.target.value)}
          className="rounded-lg border border-gray-300 px-2 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
        >
          <option value="">All Sections</option>
          {sections.map((s) => (
            <option key={s} value={s}>
              Section {s}
            </option>
          ))}
        </select>

        {hasFilters && (
          <button
            onClick={() => {
              setQuery("");
              setDay("");
              setSection("");
            }}
            className="rounded-lg px-2 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-800"
          >
            Clear
          </button>
        )}

        <span className="text-[11px] text-gray-400 sm:ml-auto">
          {filtered.length} / {rows.length}
        </span>
      </div>

      {/* Table — compact */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full border-collapse text-[11px] leading-tight">
          <thead>
            <tr className="bg-[#2c3e50] text-white">
              {headers.map((h, i) => (
                <th
                  key={i}
                  className={`whitespace-nowrap px-2 py-2 text-left font-semibold ${
                    i < 2 ? "sticky left-0 z-10 bg-[#2c3e50]" : ""
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={headers.length} className="px-3 py-6 text-center text-gray-400">
                  No classes match your filters.
                </td>
              </tr>
            )}
            {filtered.map((r, ri) => (
              <tr key={ri} className={ri % 2 ? "bg-gray-50" : "bg-white"}>
                {r.map((cell, ci) => (
                  <td
                    key={ci}
                    className={`whitespace-nowrap px-2 py-1.5 ${
                      ci === 0
                        ? "sticky left-0 z-10 font-medium text-gray-900"
                        : "text-gray-700"
                    } ${ci < 2 ? (ri % 2 ? "bg-gray-50" : "bg-white") : ""}`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[11px] text-gray-400">
        Syncs automatically from the official schedule sheet.
      </p>
    </div>
  );
}
