"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type ShellUser = {
  name: string;
  email: string;
  roleName: string | null;
  permissions: string[];
};

type NavLeaf = { label: string; href: string; perm: string; icon: IconKey; anyPerm?: string[] };
type NavGroup = {
  label: string;
  perm: string;
  icon: IconKey;
  children: NavLeaf[];
};
type NavEntry = NavLeaf | NavGroup;
type NavSection = { title: string; items: NavEntry[] };

type IconKey =
  | "dashboard"
  | "team"
  | "batches"
  | "committees"
  | "clubs"
  | "events"
  | "gallery"
  | "homepage"
  | "navigation"
  | "leave"
  | "settings"
  | "users"
  | "roles";

const sections: NavSection[] = [
  {
    title: "Overview",
    items: [{ label: "Dashboard", href: "/admin", perm: "admin.access", icon: "dashboard" }],
  },
  {
    title: "Content",
    items: [
      {
        label: "Team",
        perm: "content.team",
        icon: "team",
        children: [
          { label: "Team Members", href: "/admin/team", perm: "content.team", icon: "team" },
          { label: "Batches", href: "/admin/batches", perm: "content.team", icon: "batches" },
        ],
      },
      { label: "Committees", href: "/admin/committees", perm: "content.committees", icon: "committees" },
      { label: "Clubs", href: "/admin/clubs", perm: "content.clubs", icon: "clubs" },
      { label: "Events", href: "/admin/events", perm: "content.events", icon: "events" },
      { label: "Gallery", href: "/admin/gallery", perm: "content.gallery", icon: "gallery" },
      { label: "Navigation", href: "/admin/navigation", perm: "content.navigation", icon: "navigation" },
      { label: "Leave & Timings", href: "/admin/leave", perm: "content.leave", icon: "leave" },
    ],
  },
  {
    title: "Configuration",
    items: [{ label: "Site Settings", href: "/admin/settings", perm: "content.settings", icon: "settings" }],
  },
  {
    title: "Access Control",
    items: [
      { label: "Users", href: "/admin/users", perm: "users.view", icon: "users" },
    ],
  },
];

function isGroup(e: NavEntry): e is NavGroup {
  return (e as NavGroup).children !== undefined;
}

function Icon({ name, className = "h-4 w-4" }: { name: IconKey; className?: string }) {
  const common = {
    className,
    fill: "none",
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    strokeWidth: 1.8,
  } as const;
  switch (name) {
    case "dashboard":
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h5v7H4V5zm0 9h6v6H5a1 1 0 01-1-1v-5zm10-10h5a1 1 0 011 1v5h-6V4zm0 9h6v6a1 1 0 01-1 1h-5v-7z" />
        </svg>
      );
    case "team":
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4zm6 0a3 3 0 10-3-3" />
        </svg>
      );
    case "batches":
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0v7m-5-9.5V17a5 3 0 0010 0v-2.5" />
        </svg>
      );
    case "committees":
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    case "clubs":
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      );
    case "events":
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    case "gallery":
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    case "homepage":
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      );
    case "navigation":
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      );
    case "leave":
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    case "settings":
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    case "users":
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      );
    case "roles":
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
  }
}

export default function AdminShell({
  user,
  children,
}: {
  user: ShellUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const can = (perm: string) => user.permissions.includes(perm);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  const leafActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 transform flex-col bg-[#1f2d3d] text-gray-200 transition-transform lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 flex-shrink-0 items-center gap-2 border-b border-white/10 px-6">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
            SC
          </span>
          <span className="font-bold text-white">Admin Panel</span>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {sections.map((section) => {
            // Only show items the user can access.
            const items = section.items.filter((entry) => {
              if (isGroup(entry)) return entry.children.some((c) => can(c.perm));
              if (entry.anyPerm) return entry.anyPerm.some((p) => can(p));
              return can(entry.perm);
            });
            if (items.length === 0) return null;
            return (
              <NavSectionBlock
                key={section.title}
                title={section.title}
                items={items}
                pathname={pathname}
                can={can}
                leafActive={leafActive}
                onNavigate={() => setOpen(false)}
              />
            );
          })}
        </nav>

        {/* Visit public site */}
        <div className="flex-shrink-0 border-t border-white/10 p-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-blue-200 transition-colors hover:bg-white/10 hover:text-white"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5h5m0 0v5m0-5L10 14M9 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-3" />
            </svg>
            Visit Site
          </a>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b bg-white px-4 sm:px-6">
          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded-md p-2 hover:bg-gray-100 lg:hidden"
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="ml-auto flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.roleName ?? "No role"}</p>
            </div>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-2 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 sm:inline-flex"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5h5m0 0v5m0-5L10 14M9 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-3" />
              </svg>
              Visit Site
            </a>
            <button
              onClick={logout}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Sign Out
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

function NavSectionBlock({
  title,
  items,
  pathname,
  can,
  leafActive,
  onNavigate,
}: {
  title: string;
  items: NavEntry[];
  pathname: string;
  can: (perm: string) => boolean;
  leafActive: (href: string) => boolean;
  onNavigate: () => void;
}) {
  // A section is open by default; collapsing it slides its items away.
  const [openSection, setOpenSection] = useState(true);

  return (
    <div className="pb-1">
      <button
        onClick={() => setOpenSection((v) => !v)}
        className="flex w-full items-center justify-between px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400 transition-colors hover:text-gray-200"
      >
        <span>{title}</span>
        <svg
          className={`h-3.5 w-3.5 transition-transform duration-200 ${openSection ? "" : "-rotate-90"}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          openSection ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="space-y-0.5">
            {items.map((entry) => {
              if (isGroup(entry)) {
                const children = entry.children.filter((c) => can(c.perm));
                return (
                  <NavGroupItem
                    key={entry.label}
                    group={{ ...entry, children }}
                    pathname={pathname}
                    onNavigate={onNavigate}
                  />
                );
              }
              const active = leafActive(entry.href);
              return (
                <Link
                  key={entry.href}
                  href={entry.href}
                  onClick={onNavigate}
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active ? "bg-blue-600 text-white shadow-sm" : "text-gray-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon name={entry.icon} />
                  <span>{entry.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function NavGroupItem({
  group,
  pathname,
  onNavigate,
}: {
  group: NavGroup;
  pathname: string;
  onNavigate: () => void;
}) {
  const groupActive = group.children.some((c) => pathname.startsWith(c.href));
  const [expanded, setExpanded] = useState(groupActive);

  return (
    <div>
      <button
        onClick={() => setExpanded((v) => !v)}
        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          groupActive ? "text-white" : "text-gray-300 hover:bg-white/10 hover:text-white"
        }`}
      >
        <Icon name={group.icon} />
        <span className="flex-1 text-left">{group.label}</span>
        <svg
          className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`grid transition-all duration-200 ${
          expanded ? "mt-0.5 grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="ml-4 space-y-0.5 border-l border-white/10 pl-3">
            {group.children.map((c) => {
              const active = pathname.startsWith(c.href);
              return (
                <Link
                  key={c.href}
                  href={c.href}
                  onClick={onNavigate}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                    active ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon name={c.icon} className="h-3.5 w-3.5" />
                  <span>{c.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
