import type { RowDataPacket } from "mysql2";
import db from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import EventsManager, { type EventRow } from "./EventsManager";

export const dynamic = "force-dynamic";

async function getEvents(): Promise<EventRow[]> {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT id, name, description, gallery, display_order, is_active
       FROM events
      WHERE event_type = 'flagship'
      ORDER BY display_order, id`
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
    return {
      id: r.id,
      name: r.name,
      description: r.description ?? "",
      images,
      displayOrder: Number(r.display_order ?? 0),
      isActive: !!r.is_active,
    };
  });
}

export default async function AdminEventsPage() {
  await requirePermission("content.events");
  const events = await getEvents();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Flagship Events</h1>
      <p className="mt-1 text-sm text-gray-500">
        Manage Infusion, TEDxIIMRohtak and other flagship events with their photo
        galleries.
      </p>
      <EventsManager initialEvents={events} />
    </div>
  );
}
