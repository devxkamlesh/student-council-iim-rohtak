// Seeds REAL website data into the database (team, committees, clubs).
// Imports the data directly from src/lib/data.ts so there are no transcription
// errors. Idempotent: clears the target tables, then inserts.
// Usage: npx tsx scripts/seed-db.ts
import mysql from "mysql2/promise";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  seniorTeam,
  sc15Team,
  committees,
  domainClubs,
  recreationalClubs,
} from "../src/lib/data";

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

  // --- Team Members ---
  await conn.query("DELETE FROM team_members");
  const teamRows: (string | number)[][] = [];
  seniorTeam.forEach((m, i) =>
    teamRows.push([m.name, m.position, m.email, m.linkedin, m.image, "SC16", i + 1])
  );
  sc15Team.forEach((m, i) =>
    teamRows.push([m.name, m.position, m.email, m.linkedin, m.image, "SC15", i + 1])
  );
  await conn.query(
    "INSERT INTO team_members (name, position, email, linkedin_url, image_url, council_batch, display_order) VALUES ?",
    [teamRows]
  );
  console.log(`Inserted ${teamRows.length} team members`);

  // --- Committees ---
  await conn.query("DELETE FROM committees");
  const committeeRows = committees.map((c, i) => [
    c.name,
    c.description,
    c.socials.email ?? null,
    c.socials.instagram ?? null,
    c.socials.linkedin ?? null,
    c.socials.facebook ?? null,
    c.image,
    i + 1,
  ]);
  await conn.query(
    "INSERT INTO committees (name, description, email, instagram_url, linkedin_url, facebook_url, image_url, display_order) VALUES ?",
    [committeeRows]
  );
  console.log(`Inserted ${committeeRows.length} committees`);

  // --- Clubs (domain + recreational) ---
  await conn.query("DELETE FROM clubs");
  const clubRows: (string | null | number)[][] = [];
  domainClubs.forEach((c, i) =>
    clubRows.push([
      c.name,
      "domain",
      c.description,
      c.socials.email ?? null,
      c.socials.instagram ?? null,
      c.socials.linkedin ?? null,
      c.socials.facebook ?? null,
      c.image,
      i + 1,
    ])
  );
  recreationalClubs.forEach((c, i) =>
    clubRows.push([
      c.name,
      "recreational",
      c.description,
      null,
      null,
      null,
      null,
      c.image,
      i + 1,
    ])
  );
  await conn.query(
    "INSERT INTO clubs (name, club_type, description, email, instagram_url, linkedin_url, facebook_url, image_url, display_order) VALUES ?",
    [clubRows]
  );
  console.log(
    `Inserted ${clubRows.length} clubs (${domainClubs.length} domain + ${recreationalClubs.length} recreational)`
  );

  await conn.end();
  console.log("Seed complete.");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
