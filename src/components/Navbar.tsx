import { getNavTree, getSiteSettings } from "@/lib/queries";
import { getSessionUser } from "@/lib/auth";
import NavbarClient from "@/components/NavbarClient";

// Server component: loads the menu from the DB and hands it to the client
// navbar. Existing `import Navbar from "@/components/Navbar"` usages keep working.
export default async function Navbar() {
  const [links, user, settings] = await Promise.all([
    getNavTree(),
    getSessionUser(),
    getSiteSettings(),
  ]);

  // The Calendar page is special-access only — never expose it in the public
  // menu. We inject it conditionally for users who can actually open it.
  const publicLinks = links.filter((l) => l.href !== "/calendar");

  // Calendar link shows for users with the special calendar.access permission.
  const canCalendar = !!user && user.permissions.includes("calendar.access");

  return (
    <NavbarClient
      links={publicLinks}
      isLoggedIn={!!user}
      canCalendar={canCalendar}
      logoUrl={settings.logoUrl}
    />
  );
}
