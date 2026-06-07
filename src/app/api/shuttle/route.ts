import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.query(
      "SELECT * FROM shuttle_timings WHERE is_active = TRUE ORDER BY FIELD(day_of_week, 'tuesday', 'thursday', 'saturday', 'sunday'), from_campus_time"
    );
    return NextResponse.json({ data: rows });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch shuttle timings";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
