import { NextResponse } from "next/server";
import { z } from "zod";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import db from "@/lib/db";
import { withPermission, assertSameOrigin } from "@/lib/api-guard";
import cloudinary from "@/lib/cloudinary";

export const runtime = "nodejs";

const updateSchema = z.object({
  caption: z.string().max(500).optional(),
  displayOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
  // When present, replaces the image itself (re-uploads an edited version).
  dataUrl: z.string().startsWith("data:image/").max(15_000_000).optional(),
});

// PUT /api/admin/gallery/[id] — update caption / order / visibility, or replace
// the image with an edited version.
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return withPermission("content.gallery", async () => {
    assertSameOrigin(req);
    const body = await req.json().catch(() => null);
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    }

    // --- Image replacement path ---
    if (parsed.data.dataUrl) {
      const [rows] = await db.query<RowDataPacket[]>(
        "SELECT public_id FROM gallery_images WHERE id = ? LIMIT 1",
        [Number(id)]
      );
      const oldPublicId = rows[0]?.public_id as string | undefined;

      const result = await cloudinary.uploader.upload(parsed.data.dataUrl, {
        folder: "student-council/gallery",
      });

      await db.query<ResultSetHeader>(
        `UPDATE gallery_images
            SET public_id = ?, secure_url = ?, width = ?, height = ?, format = ?, bytes = ?
          WHERE id = ?`,
        [
          result.public_id,
          result.secure_url,
          result.width ?? null,
          result.height ?? null,
          result.format ?? null,
          result.bytes ?? null,
          Number(id),
        ]
      );

      // Remove the previous Cloudinary asset (best-effort).
      if (oldPublicId && oldPublicId !== result.public_id) {
        try {
          await cloudinary.uploader.destroy(oldPublicId);
        } catch (e) {
          console.error("Cloudinary destroy (replace) failed:", e);
        }
      }
      return NextResponse.json({ ok: true, url: result.secure_url });
    }

    // --- Metadata update path ---
    const fields: string[] = [];
    const values: (string | number | null)[] = [];
    if (parsed.data.caption !== undefined) {
      fields.push("caption = ?");
      values.push(parsed.data.caption || null);
    }
    if (parsed.data.displayOrder !== undefined) {
      fields.push("display_order = ?");
      values.push(parsed.data.displayOrder);
    }
    if (parsed.data.isActive !== undefined) {
      fields.push("is_active = ?");
      values.push(parsed.data.isActive ? 1 : 0);
    }
    if (fields.length === 0) {
      return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
    }
    values.push(Number(id));
    await db.query<ResultSetHeader>(
      `UPDATE gallery_images SET ${fields.join(", ")} WHERE id = ?`,
      values
    );
    return NextResponse.json({ ok: true });
  });
}

// DELETE /api/admin/gallery/[id] — remove from Cloudinary and the database.
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return withPermission("content.gallery", async () => {
    assertSameOrigin(req);

    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT public_id FROM gallery_images WHERE id = ? LIMIT 1",
      [Number(id)]
    );
    const publicId = rows[0]?.public_id as string | undefined;

    if (publicId) {
      // Best-effort delete from Cloudinary; proceed even if it fails.
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (e) {
        console.error("Cloudinary destroy failed:", e);
      }
    }

    await db.query<ResultSetHeader>("DELETE FROM gallery_images WHERE id = ?", [
      Number(id),
    ]);
    return NextResponse.json({ ok: true });
  });
}
