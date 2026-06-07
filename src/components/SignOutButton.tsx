"use client";

import { useRouter } from "next/navigation";

export default function SignOutButton({
  className = "",
  label = "Sign Out",
}: {
  className?: string;
  label?: string;
}) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <button onClick={logout} className={className}>
      {label}
    </button>
  );
}
