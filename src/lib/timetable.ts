// Fetches the class timetable from a published Google Sheet (CSV export) and
// parses it. Auto-refreshes hourly via Next.js fetch revalidation — update the
// sheet and the site picks it up, no deploy needed (like wpDataTables).

const TIMETABLE_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vT5aXWEsSjjT5GrVl63UQMwXRFQUBZsmsvortoRGUQKhHUhRc8Bsz1OWavoV3ko3c8Wps51a7kJ8KoF/pub?gid=1670371431&single=true&output=csv";

export type Timetable = {
  headers: string[];
  rows: string[][];
};

/** Parses a single CSV line, honoring double-quoted fields. */
function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"') {
        if (line[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      out.push(field);
      field = "";
    } else {
      field += c;
    }
  }
  out.push(field);
  return out.map((f) => f.trim());
}

/** Removes trailing empty columns shared across the header. */
function trimTrailingEmpty(headers: string[], rows: string[][]) {
  let last = headers.length;
  while (last > 0 && !headers[last - 1]) last--;
  return {
    headers: headers.slice(0, last),
    rows: rows.map((r) => r.slice(0, last)),
  };
}

export async function getTimetable(): Promise<Timetable | null> {
  try {
    const res = await fetch(TIMETABLE_CSV_URL, {
      next: { revalidate: 3600 }, // refresh from the sheet hourly
    });
    if (!res.ok) return null;
    const text = await res.text();

    const lines = text
      .split(/\r?\n/)
      .filter((l) => l.trim().length > 0);
    if (lines.length === 0) return null;

    const headers = parseCsvLine(lines[0]);
    let rows = lines.slice(1).map(parseCsvLine);

    // Normalize row widths to the header width.
    const width = headers.length;
    rows = rows.map((r) => {
      const copy = [...r];
      while (copy.length < width) copy.push("");
      return copy.slice(0, width);
    });

    // The sheet uses merged cells: within each day block the weekday name sits
    // on one sub-row and the date on another. Group rows into day-blocks and
    // give every row in the block a combined "Weekday, Date" label.
    const WEEKDAYS = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    const isWeekday = (s: string) => WEEKDAYS.includes(s.trim().toLowerCase());
    const isDate = (s: string) => /\d/.test(s) && /[-/]/.test(s);

    type Block = { weekday: string; date: string; rows: string[][] };
    const blocks: Block[] = [];
    let current: Block | null = null;
    for (const r of rows) {
      const cell = (r[0] ?? "").trim();
      if (isWeekday(cell)) {
        current = { weekday: cell, date: "", rows: [r] };
        blocks.push(current);
      } else {
        if (!current) {
          current = { weekday: "", date: "", rows: [] };
          blocks.push(current);
        }
        current.rows.push(r);
        if (isDate(cell)) current.date = cell;
      }
    }
    for (const b of blocks) {
      const label =
        b.weekday && b.date
          ? `${b.weekday}, ${b.date}`
          : b.weekday || b.date;
      for (const r of b.rows) if (label) r[0] = label;
    }

    return trimTrailingEmpty(headers, rows);
  } catch {
    return null;
  }
}
