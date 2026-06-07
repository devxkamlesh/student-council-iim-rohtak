import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.query("SELECT 1 as connected");
    return NextResponse.json({
      status: "ok",
      database: "connected",
      result: rows,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown database error";
    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
        error: message,
      },
      { status: 500 }
    );
  }
}
