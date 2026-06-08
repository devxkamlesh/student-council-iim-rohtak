import "server-only";
import { cache } from "react";
import type { RowDataPacket } from "mysql2";
import db from "@/lib/db";
import { SITE } from "@/lib/data";
import type { TeamMember, Committee, Club, SocialLinks } from "@/lib/data";

/** Build a socials object, omitting empty values. */
function toSocials(row: RowDataPacket): SocialLinks {
  const s: SocialLinks = {};
  if (row.email) s.email = row.email;
  if (row.instagram_url) s.instagram = row.instagram_url;
  if (row.linkedin_url) s.linkedin = row.linkedin_url;
  if (row.facebook_url) s.facebook = row.facebook_url;
  return s;
}

/** Team members for a given council batch ("SC16" current, "SC15" previous). */
export async function getTeamMembers(batch: string): Promise<TeamMember[]> {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT name, position, email, linkedin_url, image_url
       FROM team_members
      WHERE council_batch = ? AND is_active = TRUE
      ORDER BY display_order`,
    [batch]
  );
  return rows.map((r) => ({
    name: r.name,
    position: r.position,
    email: r.email,
    linkedin: r.linkedin_url ?? "#",
    image: r.image_url,
  }));
}

/** All active committees, ordered. */
export async function getCommittees(): Promise<Committee[]> {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT name, description, email, instagram_url, linkedin_url, facebook_url, image_url
       FROM committees
      WHERE is_active = TRUE
      ORDER BY display_order`
  );
  return rows.map((r) => ({
    name: r.name,
    description: r.description ?? "",
    image: r.image_url,
    socials: toSocials(r),
  }));
}

/** Clubs filtered by type ("domain" or "recreational"). */
export async function getClubs(
  type: "domain" | "recreational"
): Promise<Club[]> {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT name, description, email, instagram_url, linkedin_url, facebook_url, image_url
       FROM clubs
      WHERE club_type = ? AND is_active = TRUE
      ORDER BY display_order`,
    [type]
  );
  return rows.map((r) => ({
    name: r.name,
    description: r.description ?? "",
    image: r.image_url,
    socials: toSocials(r),
  }));
}

/** Live counts used for the homepage stats bar. */
export async function getCounts(): Promise<{
  committees: number;
  clubs: number;
}> {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT
       (SELECT COUNT(*) FROM committees WHERE is_active = TRUE) AS committees,
       (SELECT COUNT(*) FROM clubs WHERE is_active = TRUE)      AS clubs`
  );
  return {
    committees: Number(rows[0]?.committees ?? 0),
    clubs: Number(rows[0]?.clubs ?? 0),
  };
}

/** Flagship events with their image galleries (carousel). */
export async function getFlagshipEvents(): Promise<
  { name: string; description: string; images: string[] }[]
> {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT name, description, gallery, image_url
       FROM events
      WHERE event_type = 'flagship' AND is_active = TRUE
      ORDER BY display_order`
  );
  return rows.map((r) => {
    let images: string[] = [];
    if (Array.isArray(r.gallery)) images = r.gallery as string[];
    else if (typeof r.gallery === "string" && r.gallery) {
      try {
        images = JSON.parse(r.gallery);
      } catch {
        images = [];
      }
    }
    if (images.length === 0 && r.image_url) images = [r.image_url];
    return { name: r.name, description: r.description ?? "", images };
  });
}

export type ShuttleDay = {
  day: string;
  campus: string[];
  rajiv: string[];
};

/** Shuttle timings grouped by day, in week order. */
export async function getShuttleTimings(): Promise<ShuttleDay[]> {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT day_of_week, from_campus_time, from_rajiv_chowk_time
       FROM shuttle_timings
      WHERE is_active = TRUE
      ORDER BY FIELD(day_of_week, 'monday','tuesday','wednesday','thursday','friday','saturday','sunday'),
               from_campus_time`
  );
  const order = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];
  const labels: Record<string, string> = {
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
  };
  const fmt = (t: string) => {
    // t is "HH:MM:SS" -> "h:MM AM/PM"
    const [hStr, mStr] = t.split(":");
    let h = Number(hStr);
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${mStr} ${ampm}`;
  };
  const grouped: Record<string, ShuttleDay> = {};
  for (const r of rows) {
    const d = r.day_of_week as string;
    if (!grouped[d]) grouped[d] = { day: labels[d] ?? d, campus: [], rajiv: [] };
    grouped[d].campus.push(fmt(r.from_campus_time));
    grouped[d].rajiv.push(fmt(r.from_rajiv_chowk_time));
  }
  return order.filter((d) => grouped[d]).map((d) => grouped[d]);
}

export type OtherTiming = { label: string; time: string };

/** Parcel room / doctor and other service timings. */
export async function getOtherTimings(): Promise<OtherTiming[]> {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT label, time_value
       FROM other_timings
      WHERE is_active = TRUE
      ORDER BY display_order`
  );
  return rows.map((r) => ({ label: r.label, time: r.time_value }));
}

export type Batch = {
  id: number;
  code: string;
  label: string;
  isCurrent: boolean;
};

/** All council batches, newest first (current batch always sorts first). */
export async function getBatches(): Promise<Batch[]> {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT id, code, label, is_current
       FROM council_batches
      ORDER BY is_current DESC, display_order DESC`
  );
  return rows.map((r) => ({
    id: r.id,
    code: r.code,
    label: r.label,
    isCurrent: !!r.is_current,
  }));
}

export type BatchTeam = {
  code: string;
  label: string;
  isCurrent: boolean;
  members: TeamMember[];
};

/**
 * Returns every batch (current first, then newest→oldest) together with its
 * members. Uses just two queries (batches + all members) instead of N+1.
 */
export async function getTeamByBatches(): Promise<BatchTeam[]> {
  const batches = await getBatches();
  if (batches.length === 0) return [];

  // One query for all members across batches.
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT name, position, email, linkedin_url, image_url, council_batch
       FROM team_members
      WHERE is_active = TRUE
      ORDER BY display_order`
  );

  const byBatch = new Map<string, TeamMember[]>();
  for (const r of rows) {
    const code = r.council_batch as string;
    if (!code) continue;
    const arr = byBatch.get(code) ?? [];
    arr.push({
      name: r.name,
      position: r.position,
      email: r.email,
      linkedin: r.linkedin_url ?? "#",
      image: r.image_url,
    });
    byBatch.set(code, arr);
  }

  const result: BatchTeam[] = [];
  for (const b of batches) {
    const members = byBatch.get(b.code) ?? [];
    if (members.length > 0) {
      result.push({ code: b.code, label: b.label, isCurrent: b.isCurrent, members });
    }
  }
  return result;
}


export type NavItem = {
  id: number;
  label: string;
  href: string;
  external: boolean;
  children: NavItem[];
};

/**
 * Navigation menu as a tree (top-level items with their sub-pages).
 * Wrapped in React cache so Navbar + Footer share a single query per request.
 */
export const getNavTree = cache(async (): Promise<NavItem[]> => {
  try {
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT id, label, href, parent_id, is_external
         FROM nav_links
        WHERE is_active = TRUE
        ORDER BY display_order, id`
    );

    const byId = new Map<number, NavItem>();
    const roots: NavItem[] = [];

    for (const r of rows) {
      byId.set(r.id, {
        id: r.id,
        label: r.label,
        href: r.href,
        external: !!r.is_external,
        children: [],
      });
    }
    for (const r of rows) {
      const node = byId.get(r.id)!;
      if (r.parent_id && byId.has(r.parent_id)) {
        byId.get(r.parent_id)!.children.push(node);
      } else {
        roots.push(node);
      }
    }
    if (roots.length > 0) return roots;
  } catch {
    // fall through to default below
  }

  // Fallback menu (used only if the DB is unreachable).
  return [
    { id: -1, label: "Home", href: "/", external: false, children: [] },
    { id: -2, label: "Committees", href: "/committees", external: false, children: [] },
    { id: -3, label: "Clubs", href: "/clubs", external: false, children: [] },
    { id: -4, label: "RC's & Events", href: "/events", external: false, children: [] },
    { id: -5, label: "Leave & Others", href: "/leave", external: false, children: [] },
    { id: -6, label: "Student Form", href: "/student-form", external: false, children: [] },
  ];
});

export type SiteSettings = {
  logoUrl: string;
  heroBannerUrl: string;
  footerLogoUrl: string;
};

/**
 * Site-wide branding settings (logo, hero banner, footer logo). Falls back to
 * the static SITE defaults when a value isn't set in the database.
 * Wrapped in React cache so Navbar + Footer + Home share one query per request.
 */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const defaults: SiteSettings = {
    logoUrl: SITE.logo,
    heroBannerUrl: SITE.banner,
    footerLogoUrl: SITE.logo,
  };
  try {
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT setting_key, setting_value FROM site_settings"
    );
    const map = new Map<string, string>();
    for (const r of rows) {
      if (r.setting_value) map.set(r.setting_key, r.setting_value);
    }
    return {
      logoUrl: map.get("logo_url") || defaults.logoUrl,
      heroBannerUrl: map.get("hero_banner_url") || defaults.heroBannerUrl,
      footerLogoUrl:
        map.get("footer_logo_url") || map.get("logo_url") || defaults.footerLogoUrl,
    };
  } catch {
    return defaults;
  }
});
