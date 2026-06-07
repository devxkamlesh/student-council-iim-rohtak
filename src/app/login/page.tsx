import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Student Council admin sign in.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  // Only allow safe, in-app relative paths as the redirect target.
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : null;

  // If already signed in, route to the right place.
  const user = await getSessionUser();
  if (user) {
    // Admins (and special-access users, who also have admin.access) go to the
    // panel or the requested page. Everyone else goes to the public home page.
    if (user.permissions.includes("admin.access")) redirect(safeNext ?? "/admin");
    redirect("/");
  }

  const googleEnabled = !!process.env.GOOGLE_CLIENT_ID;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#2c3e50] via-[#34495e] to-[#1f2d3d] px-4 py-12">
      <div className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:22px_22px]" />
      <div className="relative w-full max-w-md">
        <div className="mb-6 text-center text-white">
          <h1 className="text-2xl font-bold">Student Council</h1>
          <p className="text-sm text-blue-200">Admin Sign In</p>
        </div>
        <div className="rounded-2xl bg-white p-8 shadow-2xl">
          <LoginForm googleEnabled={googleEnabled} />
        </div>
        <p className="mt-4 text-center text-xs text-blue-200/70">
          Authorized personnel only. Activity is logged.
        </p>
      </div>
    </main>
  );
}
