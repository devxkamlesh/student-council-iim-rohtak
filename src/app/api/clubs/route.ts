import { NextResponse } from "next/server";
import db from "@/lib/db";
import { NextRequest } from "next/server";
import { apiMeta } from "@/lib/attribution";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "domain" or "recreational"

    let query = "SELECT * FROM clubs WHERE is_active = TRUE";
    const params: string[] = [];

    if (type) {
      query += " AND club_type = ?";
      params.push(type);
    }

    query += " ORDER BY display_order";

    const [rows] = await db.query(query, params);
    return NextResponse.json({ data: rows, _meta: apiMeta() });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch clubs";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
