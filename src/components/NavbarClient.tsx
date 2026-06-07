"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SITE } from "@/lib/data";
import type { NavItem } from "@/lib/queries";

export default function NavbarClient({
  links,
  isLoggedIn = false,
  canCalendar = false,
  logoUrl = SITE.logo,
}: {
  links: NavItem[];
  isLoggedIn?: boolean;
  canCalendar?: boolean;
  logoUrl?: string;
}) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openGroup, setOpenGroup] = useState<number | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setOpen(false);
    router.replace("/");
    router.refresh();
  }

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const groupActive = (item: NavItem) =>
    isActive(item.href) || item.children.some((c) => isActive(c.href));

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-[#1f2d3d]/95 backdrop-blur shadow-lg" : "bg-[#2c3e50]"
      } text-white`}
    >
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6"
        aria-label="Primary"
      >
        {/* Brand */}
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <Image
            src={logoUrl}
            alt="Student Council IIM Rohtak logo"
            width={44}
            height={44}
            className="h-10 w-10 rounded-full object-cover"
            priority
          />
          <span className="flex flex-col leading-tight">
            <span className="text-base font-bold tracking-wide sm:text-lg">STUDENT COUNCIL</span>
            <span className="text-[10px] text-blue-200 sm:text-xs">{SITE.tagline}</span>
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-1 lg:flex">
          {links.map((item) =>
            item.children.length > 0 ? (
              <li key={item.id} className="group relative">
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={`flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-white/10 ${
                    groupActive(item) ? "bg-white/15 text-white" : "text-gray-100"
                  }`}
                >
                  {item.label}
                  <svg
                    className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-180"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </Link>
                {/* Dropdown */}
                <div className="invisible absolute left-1/2 top-full z-50 -translate-x-1/2 translate-y-1 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  {/* caret */}
                  <span className="absolute left-1/2 top-1.5 h-3 w-3 -translate-x-1/2 rotate-45 rounded-[2px] bg-white ring-1 ring-black/5" />
                  <ul className="relative min-w-[240px] overflow-hidden rounded-2xl border border-gray-100 bg-white p-1.5 text-gray-700 shadow-2xl shadow-black/20">
                    {item.children.map((c) => {
                      const active = isActive(c.href);
                      return (
                        <li key={c.id}>
                          <NavLeaf
                            item={c}
                            active={active}
                            className={`group/leaf flex items-center justify-between gap-2 rounded-xl px-3.5 py-2.5 text-sm transition-colors ${
                              active
                                ? "bg-blue-50 font-semibold text-blue-700"
                                : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                            }`}
                            withArrow
                          />
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </li>
            ) : (
              <li key={item.id}>
                <NavLeaf
                  item={item}
                  active={isActive(item.href)}
                  className={`rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-white/10 ${
                    isActive(item.href) ? "bg-white/15 text-white" : "text-gray-100"
                  }`}
                />
              </li>
            )
          )}
          <li>
            {isLoggedIn ? (
              <div className="ml-2 flex items-center gap-2">
                {canCalendar && (
                  <Link
                    href="/calendar"
                    className="inline-flex items-center gap-1.5 rounded-md border border-white/25 px-3 py-2 text-sm font-medium text-gray-100 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Calendar
                  </Link>
                )}
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold transition-colors hover:bg-red-700"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="ml-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold transition-colors hover:bg-blue-700"
              >
                Log In
              </Link>
            )}
          </li>
        </ul>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center justify-center rounded-md p-2 transition-colors hover:bg-white/10 lg:hidden"
          aria-expanded={open}
          aria-label="Toggle navigation menu"
        >
          {open ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        className={`overflow-hidden transition-[max-height] duration-300 lg:hidden ${
          open ? "max-h-[32rem]" : "max-h-0"
        }`}
      >
        <ul className="space-y-1 border-t border-white/10 px-4 py-3">
          {links.map((item) =>
            item.children.length > 0 ? (
              <li key={item.id}>
                <div
                  className={`flex items-center rounded-md ${
                    groupActive(item) ? "bg-white/10" : ""
                  }`}
                >
                  <NavLeaf
                    item={item}
                    active={isActive(item.href)}
                    onClick={() => setOpen(false)}
                    className={`flex-1 rounded-md px-3 py-2 text-sm font-medium hover:bg-white/10 ${
                      isActive(item.href) ? "text-white" : "text-gray-100"
                    }`}
                  />
                  <button
                    onClick={() => setOpenGroup((g) => (g === item.id ? null : item.id))}
                    aria-label={`Toggle ${item.label} submenu`}
                    className="rounded-md px-3 py-2 text-gray-200 hover:bg-white/10"
                  >
                    <svg
                      className={`h-4 w-4 transition-transform ${openGroup === item.id ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                {openGroup === item.id && (
                  <ul className="ml-3 mt-1 space-y-1 border-l border-white/10 pl-3">
                    {item.children.map((c) => (
                      <li key={c.id}>
                        <NavLeaf
                          item={c}
                          active={isActive(c.href)}
                          onClick={() => setOpen(false)}
                          className={`block rounded-md px-3 py-2 text-sm hover:bg-white/10 ${
                            isActive(c.href) ? "bg-white/15 text-white" : "text-gray-100"
                          }`}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ) : (
              <li key={item.id}>
                <NavLeaf
                  item={item}
                  active={isActive(item.href)}
                  onClick={() => setOpen(false)}
                  className={`block rounded-md px-3 py-2 text-sm font-medium hover:bg-white/10 ${
                    isActive(item.href) ? "bg-white/15 text-white" : "text-gray-100"
                  }`}
                />
              </li>
            )
          )}
          <li>
            {isLoggedIn ? (
              <div className="space-y-1">
                {canCalendar && (
                  <Link
                    href="/calendar"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 rounded-md border border-white/20 px-3 py-2 text-sm font-medium text-gray-100 hover:bg-white/10"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Calendar
                  </Link>
                )}
                <button
                  type="button"
                  onClick={logout}
                  className="block w-full rounded-md bg-red-600 px-3 py-2 text-center text-sm font-semibold hover:bg-red-700"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="block rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold hover:bg-blue-700"
              >
                Log In
              </Link>
            )}
          </li>
        </ul>
      </div>
    </header>
  );
}

function NavLeaf({
  item,
  active,
  className,
  onClick,
  withArrow = false,
}: {
  item: NavItem;
  active: boolean;
  className?: string;
  onClick?: () => void;
  withArrow?: boolean;
}) {
  const content = (
    <>
      <span>{item.label}</span>
      {withArrow && (
        <svg
          className="h-3.5 w-3.5 flex-shrink-0 opacity-0 transition-all duration-200 group-hover/leaf:translate-x-0.5 group-hover/leaf:opacity-100"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      )}
    </>
  );

  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className={className}
        aria-current={active ? "page" : undefined}
      >
        {content}
      </a>
    );
  }
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={className}
      aria-current={active ? "page" : undefined}
    >
      {content}
    </Link>
  );
}
