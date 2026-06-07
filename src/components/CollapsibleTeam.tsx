"use client";

import { useState } from "react";
import TeamCard from "./TeamCard";
import type { TeamMember } from "@/lib/data";

export default function CollapsibleTeam({
  team,
  eyebrow,
  title,
}: {
  team: TeamMember[];
  eyebrow: string;
  title: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      {/* Toggle header */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="sc15-panel"
        className="group mx-auto flex w-full max-w-md items-center justify-center gap-3 rounded-full border border-gray-200 bg-white px-6 py-4 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
      >
        <span className="flex flex-col items-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
            {eyebrow}
          </span>
          <span className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {title}
          </span>
        </span>
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white ${
            open ? "rotate-180" : ""
          }`}
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      {/* Animated panel */}
      <div
        id="sc15-panel"
        className={`grid transition-all duration-500 ease-in-out ${
          open ? "mt-12 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          {/* Leadership */}
          <div className="mb-12 flex flex-wrap justify-center gap-10 sm:gap-16">
            {team.slice(0, 2).map((m, i) => (
              <div
                key={m.name}
                className={`transition-all duration-500 ${
                  open
                    ? "translate-y-0 opacity-100"
                    : "translate-y-4 opacity-0"
                }`}
                style={{ transitionDelay: open ? `${i * 80}ms` : "0ms" }}
              >
                <TeamCard member={m} featured />
              </div>
            ))}
          </div>

          {/* Secretaries */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-6">
            {team.slice(2).map((m, i) => (
              <div
                key={m.name}
                className={`transition-all duration-500 ${
                  open
                    ? "translate-y-0 opacity-100"
                    : "translate-y-4 opacity-0"
                }`}
                style={{ transitionDelay: open ? `${(i + 2) * 80}ms` : "0ms" }}
              >
                <TeamCard member={m} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
