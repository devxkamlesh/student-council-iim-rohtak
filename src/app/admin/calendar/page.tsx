import { requirePermission } from "@/lib/auth";
import { getCalendarSettings } from "@/lib/queries";
import CalendarSettingsManager from "./CalendarSettingsManager";

export const dynamic = "force-dynamic";

export default async function AdminCalendarPage() {
  await requirePermission("content.calendar");
  const settings = await getCalendarSettings();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Calendar Settings</h1>
      <p className="mt-1 text-sm text-gray-500">
        Manage the links used on the restricted Calendar page — the booking
        button, the embedded Google Calendar, and the COTY &amp; ACAA Google
        Form links.
      </p>
      <CalendarSettingsManager
        initial={{
          schedulingUrl: settings.schedulingUrl,
          embedSrc: settings.embedSrc,
          cotyFormSrc: settings.cotyFormSrc,
          acaaFormSrc: settings.acaaFormSrc,
        }}
      />
    </div>
  );
}
