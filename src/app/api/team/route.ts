import { NextResponse } from "next/server";
import db from "@/lib/db";
import { apiMeta } from "@/lib/attribution";

export async function GET() {
  try {
    const [rows] = await db.query(
      "SELECT * FROM team_members WHERE is_active = TRUE ORDER BY display_order"
    );
    return NextResponse.json({ data: rows, _meta: apiMeta() });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch team members";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
