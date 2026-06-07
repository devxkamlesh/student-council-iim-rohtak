import { requirePermission } from "@/lib/auth";
import { getSiteSettings } from "@/lib/queries";
import SettingsManager from "./SettingsManager";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requirePermission("content.settings");
  const settings = await getSiteSettings();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
      <p className="mt-1 text-sm text-gray-500">
        Manage the site logo, the homepage hero banner image, and the footer
        logo. Upload a new image or paste an image URL.
      </p>
      <SettingsManager
        initial={{
          logoUrl: settings.logoUrl,
          heroBannerUrl: settings.heroBannerUrl,
          footerLogoUrl: settings.footerLogoUrl,
        }}
      />
    </div>
  );
}
