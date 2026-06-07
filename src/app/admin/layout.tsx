import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  // Must be signed in AND have admin access.
  if (!user) redirect("/login");
  // Signed in but without panel access → send them to the public home page.
  if (!user.permissions.includes("admin.access")) redirect("/");

  return (
    <AdminShell
      user={{
        name: user.name,
        email: user.email,
        roleName: user.roleName,
        permissions: user.permissions,
      }}
    >
      {children}
    </AdminShell>
  );
}
