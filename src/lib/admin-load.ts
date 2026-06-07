import "server-only";
import type { RowDataPacket } from "mysql2";
import db from "@/lib/db";
import { CONTENT, type ContentRow } from "@/lib/content-config";

/** Loads all rows for a content entity (only the columns the admin UI needs). */
export async function loadRows(entityKey: string): Promise<ContentRow[]> {
  const entity = CONTENT[entityKey];
  if (!entity) return [];
  const cols = ["id", ...entity.fields.map((f) => f.name), "is_active"];
  const sql = `SELECT ${cols
    .map((c) => `\`${c}\``)
    .join(", ")} FROM \`${entity.table}\` ORDER BY \`display_order\`, id`;
  const [rows] = await db.query<RowDataPacket[]>(sql);
  return rows as ContentRow[];
}
