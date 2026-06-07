import type { RowDataPacket } from "mysql2";
import db from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import GalleryManager, { type GalleryRow } from "./GalleryManager";

export const dynamic = "force-dynamic";

async function getImages(): Promise<GalleryRow[]> {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT id, secure_url, caption, display_order, is_active, bytes, format, width, height
       FROM gallery_images
      ORDER BY display_order, created_at DESC, id DESC`
  );
  return rows.map((r) => ({
    id: r.id,
    url: r.secure_url,
    caption: r.caption ?? "",
    displayOrder: Number(r.display_order ?? 0),
    isActive: !!r.is_active,
    bytes: Number(r.bytes ?? 0),
    format: r.format ?? "",
    width: Number(r.width ?? 0),
    height: Number(r.height ?? 0),
  }));
}

export default async function AdminGalleryPage() {
  await requirePermission("content.gallery");
  const images = await getImages();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Gallery</h1>
      <p className="mt-1 text-sm text-gray-500">
        Upload photos to the public gallery. Images are stored and optimized on
        Cloudinary.
      </p>
      <GalleryManager initialImages={images} />
    </div>
  );
}
