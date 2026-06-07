import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { student_name, student_email, batch, subject, message } = body;

    // Basic validation
    if (!student_name || !student_email || !subject || !message) {
      return NextResponse.json(
        { error: "All required fields must be provided" },
        { status: 400 }
      );
    }

    await db.query(
      "INSERT INTO grievances (student_name, student_email, batch, subject, message) VALUES (?, ?, ?, ?, ?)",
      [student_name, student_email, batch || null, subject, message]
    );

    return NextResponse.json(
      { message: "Grievance submitted successfully" },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to submit grievance";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
