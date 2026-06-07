import Image from "next/image";
import Link from "next/link";
import { SITE } from "@/lib/data";
import { getNavTree, getSiteSettings } from "@/lib/queries";
import DevBadge from "@/components/DevBadge";

export default async function Footer() {
  const [tree, settings] = await Promise.all([getNavTree(), getSiteSettings()]);
  // Flatten top-level items + their sub-pages for the quick links list.
  const links = tree.flatMap((item) =>
    item.children.length > 0 ? item.children : [item]
  );

  return (
    <footer className="relative mt-auto overflow-hidden bg-gradient-to-br from-[#2c3e50] via-[#34495e] to-[#1f2d3d] text-gray-300">
      {/* dotted grid overlay (same as hero) */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:22px_22px]" />
      <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        {/* Brand */}
        <div>
          <div className="mb-4 flex items-center gap-3">
            <span className="flex items-center justify-center rounded-full bg-white p-1">
              <Image
                src={settings.footerLogoUrl}
                alt="Student Council IIM Rohtak logo"
                width={44}
                height={44}
                className="h-10 w-10 rounded-full object-cover"
              />
            </span>
            <div>
              <p className="font-bold text-white">STUDENT COUNCIL</p>
              <p className="text-xs text-blue-200">{SITE.tagline}</p>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-gray-400">
            The central pillar of the General Student Body at IIM Rohtak,
            dedicated to representing and promoting the interests of all
            students.
          </p>
        </div>

        {/* Quick links */}
        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
            Quick Links
          </h2>
          <ul className="grid grid-cols-2 gap-2 text-sm">
            {links.map((link) => (
              <li key={link.id}>
                {link.external ? (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    href={link.href}
                    className="text-gray-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
            Contact
          </h2>
          <a
            href={`mailto:${SITE.email}`}
            className="text-sm text-gray-400 transition-colors hover:text-white"
          >
            {SITE.email}
          </a>
          <p className="mt-3 text-sm text-gray-400">
            Indian Institute of Management Rohtak, Haryana, India
          </p>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-gray-400 sm:flex-row sm:px-6">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <Link href="/terms" className="hover:text-white">
              Terms &amp; Conditions
            </Link>
            <span className="opacity-40">|</span>
            <Link href="/privacy" className="hover:text-white">
              Privacy Policy
            </Link>
            <span className="opacity-40">|</span>
            <Link href="/disclaimer" className="hover:text-white">
              Disclaimer
            </Link>
          </div>
          <p>© {new Date().getFullYear()} Student Council Team, IIM Rohtak.</p>
        </div>
        {/* Developer attribution */}
        <div className="mx-auto max-w-7xl px-4 pb-5 text-center text-xs sm:px-6">
          <DevBadge />
        </div>
      </div>
    </footer>
  );
}
