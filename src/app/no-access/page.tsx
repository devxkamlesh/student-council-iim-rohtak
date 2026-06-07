import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import SignOutButton from "@/components/SignOutButton";

export const metadata: Metadata = {
  title: "Access Pending",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function NoAccessPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  // If they actually have access, send them to the panel.
  if (user.permissions.includes("admin.access")) redirect("/admin");
  // Calendar-only users have their own page.
  if (user.permissions.includes("calendar.access")) redirect("/calendar");

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#2c3e50] via-[#34495e] to-[#1f2d3d] px-4 py-12">
      <div className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:22px_22px]" />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5 19h14a2 2 0 001.84-2.75L13.74 4a2 2 0 00-3.5 0l-7.1 12.25A2 2 0 005 19z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-900">Access Pending</h1>
        <p className="mt-2 text-sm text-gray-600">
          You&apos;re signed in as{" "}
          <span className="font-medium text-gray-800">{user.email}</span>, but
          your account doesn&apos;t have admin access yet. An administrator needs
          to assign you a role.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <SignOutButton
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            label="Sign out"
          />
          <a
            href="/"
            className="text-sm text-gray-500 transition-colors hover:text-gray-800"
          >
            Go to website
          </a>
        </div>
      </div>
    </main>
  );
}
