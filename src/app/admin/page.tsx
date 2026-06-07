import Link from "next/link";
import type { RowDataPacket } from "mysql2";
import db from "@/lib/db";
import { requireUser } from "@/lib/auth";
import {
  ScoreRing,
  MultiRing,
  AreaLineChart,
  DonutChart,
} from "./DashboardCharts";

export const dynamic = "force-dynamic";

async function safeCount(sql: string): Promise<number> {
  try {
    const [rows] = await db.query<RowDataPacket[]>(sql);
    return Number(rows[0]?.c ?? 0);
  } catch {
    return 0;
  }
}

async function getStats() {
  const [
    team, committees, clubsDomain, clubsRec, events, gallery,
    highlights, navLinks, users, activeUsers,
  ] = await Promise.all([
    safeCount("SELECT COUNT(*) c FROM team_members"),
    safeCount("SELECT COUNT(*) c FROM committees"),
    safeCount("SELECT COUNT(*) c FROM clubs WHERE club_type = 'domain'"),
    safeCount("SELECT COUNT(*) c FROM clubs WHERE club_type = 'recreational'"),
    safeCount("SELECT COUNT(*) c FROM events"),
    safeCount("SELECT COUNT(*) c FROM gallery_images"),
    safeCount("SELECT COUNT(*) c FROM highlights"),
    safeCount("SELECT COUNT(*) c FROM nav_links"),
    safeCount("SELECT COUNT(*) c FROM users"),
    safeCount("SELECT COUNT(*) c FROM users WHERE is_active = TRUE"),
  ]);

  let grPending = 0, grProgress = 0, grResolved = 0;
  try {
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT status, COUNT(*) c FROM grievances GROUP BY status`
    );
    for (const r of rows) {
      if (r.status === "pending") grPending = Number(r.c);
      else if (r.status === "in_progress") grProgress = Number(r.c);
      else if (r.status === "resolved") grResolved = Number(r.c);
    }
  } catch { /* table may not exist */ }

  let monthly: { label: string; value: number }[] = [];
  try {
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT DATE_FORMAT(created_at, '%b') AS m, DATE_FORMAT(created_at, '%Y-%m') AS ym, COUNT(*) c
         FROM grievances
        WHERE created_at > (NOW() - INTERVAL 6 MONTH)
        GROUP BY ym, m ORDER BY ym`
    );
    monthly = rows.map((r) => ({ label: r.m as string, value: Number(r.c) }));
  } catch { /* ignore */ }

  return {
    team, committees, clubsDomain, clubsRec, events, gallery, highlights,
    navLinks, users, activeUsers, grPending, grProgress, grResolved, monthly,
  };
}

export default async function AdminDashboard() {
  const user = await requireUser();
  const s = await getStats();
  const can = (p: string) => user.permissions.includes(p);

  const totalContent =
    s.team + s.committees + s.clubsDomain + s.clubsRec + s.events + s.gallery;
  const totalGrievances = s.grPending + s.grProgress + s.grResolved;
  const resolvedPct =
    totalGrievances > 0 ? Math.round((s.grResolved / totalGrievances) * 100) : 0;

  const rings = [
    { label: "Team", value: s.team, max: Math.max(20, s.team), color: "#2563eb" },
    { label: "Committees", value: s.committees, max: Math.max(20, s.committees), color: "#6366f1" },
    { label: "Clubs", value: s.clubsDomain + s.clubsRec, max: Math.max(20, s.clubsDomain + s.clubsRec), color: "#10b981" },
    { label: "Gallery", value: s.gallery, max: Math.max(20, s.gallery), color: "#ec4899" },
  ];

  const usageStats = [
    { label: "Team Members", value: s.team, color: "#2563eb" },
    { label: "Committees", value: s.committees, color: "#6366f1" },
    { label: "Clubs", value: s.clubsDomain + s.clubsRec, color: "#10b981" },
    { label: "Gallery Photos", value: s.gallery, color: "#ec4899" },
  ];

  const grievanceDonut = [
    { label: "Pending", value: s.grPending, color: "#ef4444" },
    { label: "In Progress", value: s.grProgress, color: "#f59e0b" },
    { label: "Resolved", value: s.grResolved, color: "#10b981" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">
        Welcome back, {user.name}. Here&apos;s an overview.
      </p>

      <div className="mt-6 space-y-5">
        {/* Overview card (Performance-style) */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Overview</h2>
            <Link
              href="/admin/gallery"
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Manage content
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="flex items-center gap-5">
              <ScoreRing value={totalContent} max={Math.max(50, totalContent)} color="#16a34a" />
              <div>
                <p className="font-semibold text-gray-900">Published Content</p>
                <p className="mt-1 text-sm text-gray-500">
                  Across team, committees,<br />clubs, events & gallery
                </p>
              </div>
            </div>
            <div className="flex items-center gap-5 sm:border-l sm:border-gray-100 sm:pl-6">
              <ScoreRing value={resolvedPct} max={100} color="#2563eb" />
              <div>
                <p className="font-semibold text-gray-900">Grievances Resolved</p>
                <p className="mt-1 text-sm text-gray-500">
                  {s.grResolved} of {totalGrievances || 0} resolved
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content usage (Plan resource usage-style) */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Content Resource Usage</h2>
            <Link
              href="/admin/committees"
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              See details
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-8">
            <MultiRing rings={rings} />
            <div className="grid flex-1 grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-4">
              {usageStats.map((u) => (
                <div key={u.label}>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: u.color }} />
                    <span className="text-xs text-gray-500">{u.label}</span>
                  </div>
                  <p className="mt-0.5 text-lg font-bold text-gray-900">{u.value}</p>
                </div>
              ))}
              <div>
                <span className="text-xs text-gray-500">Events</span>
                <p className="mt-0.5 text-lg font-bold text-gray-900">{s.events}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Menu Links</span>
                <p className="mt-0.5 text-lg font-bold text-gray-900">{s.navLinks}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Homepage Cards</span>
                <p className="mt-0.5 text-lg font-bold text-gray-900">{s.highlights}</p>
              </div>
              {can("users.view") && (
                <div>
                  <span className="text-xs text-gray-500">Active Users</span>
                  <p className="mt-0.5 text-lg font-bold text-gray-900">
                    {s.activeUsers}
                    <span className="text-sm font-normal text-gray-400"> / {s.users}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Line + donut row (CPU/Memory-style) */}
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">Grievances — Last 6 Months</h2>
              <span className="text-xs text-gray-400">Submissions</span>
            </div>
            {s.monthly.length > 0 ? (
              <AreaLineChart data={s.monthly} color="#7c3aed" />
            ) : (
              <p className="py-10 text-center text-sm text-gray-400">No recent submissions.</p>
            )}
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-gray-900">Grievances by Status</h2>
            {totalGrievances > 0 ? (
              <DonutChart data={grievanceDonut} />
            ) : (
              <p className="py-10 text-center text-sm text-gray-400">No grievances yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
