import { NextResponse } from "next/server";
import { z } from "zod";
import type { ResultSetHeader } from "mysql2";
import db from "@/lib/db";
import { withPermission, assertSameOrigin } from "@/lib/api-guard";
import cloudinary, { GALLERY_FOLDER } from "@/lib/cloudinary";

export const runtime = "nodejs";
// Allow larger request bodies for base64-encoded image uploads.
export const maxDuration = 60;

const schema = z.object({
  // A data URL (data:image/...;base64,....) produced in the browser.
  dataUrl: z.string().startsWith("data:image/").max(15_000_000),
  caption: z.string().max(500).optional().default(""),
  displayOrder: z.number().int().optional().default(0),
});

// POST /api/admin/gallery — upload an image to Cloudinary and record it.
export async function POST(req: Request) {
  return withPermission("content.gallery", async () => {
    assertSameOrigin(req);
    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid image. Please choose a valid image file." },
        { status: 400 }
      );
    }
    const { dataUrl, caption, displayOrder } = parsed.data;

    // Upload to Cloudinary (auto format/quality kept on delivery via URL params).
    const result = await cloudinary.uploader.upload(dataUrl, {
      folder: GALLERY_FOLDER,
    });

    const [insert] = await db.query<ResultSetHeader>(
      `INSERT INTO gallery_images
         (public_id, secure_url, width, height, format, bytes, caption, display_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        result.public_id,
        result.secure_url,
        result.width ?? null,
        result.height ?? null,
        result.format ?? null,
        result.bytes ?? null,
        caption || null,
        displayOrder,
      ]
    );

    return NextResponse.json(
      { ok: true, id: insert.insertId, url: result.secure_url },
      { status: 201 }
    );
  });
}
