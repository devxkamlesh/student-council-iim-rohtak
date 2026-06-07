import { NextResponse } from "next/server";
import { z } from "zod";
import { withPermission, assertSameOrigin } from "@/lib/api-guard";
import cloudinary from "@/lib/cloudinary";

export const runtime = "nodejs";
export const maxDuration = 60;

const schema = z.object({
  dataUrl: z.string().startsWith("data:image/").max(15_000_000),
  folder: z.string().max(100).optional().default("student-council/branding"),
});

// POST /api/admin/upload — upload an image to Cloudinary, return the secure URL.
// Used by the Site Settings page (logo / banner / footer logo).
export async function POST(req: Request) {
  return withPermission("content.settings", async () => {
    assertSameOrigin(req);
    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid image. Please choose a valid image file." },
        { status: 400 }
      );
    }
    const result = await cloudinary.uploader.upload(parsed.data.dataUrl, {
      folder: parsed.data.folder,
    });
    return NextResponse.json({ ok: true, url: result.secure_url }, { status: 201 });
  });
}
