// Adds schema for dynamic content (events gallery, highlights, other_timings),
// then seeds REAL data from the website. Idempotent.
// Usage: npx tsx scripts/seed-dynamic.ts
import mysql from "mysql2/promise";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { flagshipEvents } from "../src/lib/data";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv(): Record<string, string> {
  const env: Record<string, string> = {};
  const raw = readFileSync(join(root, ".env.local"), "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq > -1) env[t.slice(0, eq).trim()] = t.slice(eq + 1).trim();
  }
  return env;
}

async function safeAlter(conn: mysql.Connection, sql: string) {
  try {
    await conn.query(sql);
  } catch (e) {
    const err = e as { code?: string };
    if (err.code === "ER_DUP_FIELDNAME") return; // column already exists
    throw e;
  }
}

async function main() {
  const env = loadEnv();
  const conn = await mysql.createConnection({
    host: env.DB_HOST,
    port: Number(env.DB_PORT) || 3306,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    connectTimeout: 20000,
  });
  console.log(`Connected to ${env.DB_HOST} / ${env.DB_NAME}`);

  // --- Schema: events gallery + ordering ---
  await safeAlter(conn, "ALTER TABLE events ADD COLUMN gallery JSON NULL");
  await safeAlter(conn, "ALTER TABLE events ADD COLUMN display_order INT DEFAULT 0");

  // --- Schema: highlights (What We Do cards) ---
  await conn.query(`
    CREATE TABLE IF NOT EXISTS highlights (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      href VARCHAR(255) NOT NULL,
      icon_key VARCHAR(50) NOT NULL,
      display_order INT DEFAULT 0,
      is_active BOOLEAN DEFAULT TRUE
    )
  `);

  // --- Schema: other_timings (parcel/doctor) ---
  await conn.query(`
    CREATE TABLE IF NOT EXISTS other_timings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      label VARCHAR(255) NOT NULL,
      time_value VARCHAR(100) NOT NULL,
      display_order INT DEFAULT 0,
      is_active BOOLEAN DEFAULT TRUE
    )
  `);

  // --- Seed: Flagship events ---
  await conn.query("DELETE FROM events");
  const eventRows = flagshipEvents.map((e, i) => [
    e.name,
    "flagship",
    e.description,
    JSON.stringify(e.images),
    i + 1,
  ]);
  await conn.query(
    "INSERT INTO events (name, event_type, description, gallery, display_order) VALUES ?",
    [eventRows]
  );
  console.log(`Inserted ${eventRows.length} flagship events`);

  // --- Seed: Highlights ---
  await conn.query("DELETE FROM highlights");
  const highlightRows = [
    ["Committees", "12 non-elected bodies driving academics, alumni relations, placements and more.", "/committees", "committees", 1],
    ["Domain Clubs", "Finance, Marketing, Analytics, HR, Strategy, Operations and Economics clubs.", "/clubs", "clubs", 2],
    ["RC's & Events", "Flagship fests Infusion & TEDxIIMRohtak plus vibrant recreational clubs.", "/events", "events", 3],
    ["Leave & Others", "Outstation leave procedure, shuttle timings and essential campus services.", "/leave", "leave", 4],
  ];
  await conn.query(
    "INSERT INTO highlights (title, description, href, icon_key, display_order) VALUES ?",
    [highlightRows]
  );
  console.log(`Inserted ${highlightRows.length} highlights`);

  // --- Seed: Shuttle timings ---
  await conn.query("DELETE FROM shuttle_timings");
  const shuttleRows: [string, string, string][] = [
    ["tuesday", "17:30:00", "19:00:00"],
    ["tuesday", "18:30:00", "20:00:00"],
    ["tuesday", "19:30:00", "21:00:00"],
    ["thursday", "17:30:00", "19:00:00"],
    ["thursday", "18:30:00", "20:00:00"],
    ["saturday", "14:00:00", "15:30:00"],
    ["saturday", "15:00:00", "16:30:00"],
    ["saturday", "16:00:00", "17:30:00"],
    ["sunday", "10:00:00", "10:30:00"],
    ["sunday", "11:15:00", "11:45:00"],
    ["sunday", "12:30:00", "13:00:00"],
    ["sunday", "14:00:00", "14:30:00"],
    ["sunday", "15:15:00", "15:45:00"],
    ["sunday", "16:30:00", "17:00:00"],
    ["sunday", "18:00:00", "18:30:00"],
  ];
  await conn.query(
    "INSERT INTO shuttle_timings (day_of_week, from_campus_time, from_rajiv_chowk_time) VALUES ?",
    [shuttleRows]
  );
  console.log(`Inserted ${shuttleRows.length} shuttle timings`);

  // --- Seed: Other timings ---
  await conn.query("DELETE FROM other_timings");
  const otherRows = [
    ["Parcel Room (Mon-Sat)", "7:00 AM - 9:00 PM", 1],
    ["Parcel Room (Sunday)", "9:00 AM - 5:00 PM", 2],
    ["Doctor (Afternoon)", "12:00 PM - 2:00 PM", 3],
    ["Doctor (Evening)", "4:00 PM - 6:00 PM", 4],
  ];
  await conn.query(
    "INSERT INTO other_timings (label, time_value, display_order) VALUES ?",
    [otherRows]
  );
  console.log(`Inserted ${otherRows.length} other timings`);

  await conn.end();
  console.log("Dynamic seed complete.");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
