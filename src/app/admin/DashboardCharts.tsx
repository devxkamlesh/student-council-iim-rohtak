"use client";

export type Datum = { label: string; value: number };
export type DonutDatum = { label: string; value: number; color: string };
export type Ring = { label: string; value: number; max: number; color: string };

/** Single progress ring with a big centered number (Hostinger "score" style). */
export function ScoreRing({
  value,
  max,
  color = "#16a34a",
  size = 132,
}: {
  value: number;
  max: number;
  color?: string;
  size?: number;
}) {
  const stroke = 12;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const frac = max > 0 ? Math.min(1, value / max) : 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eef2f7" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${frac * circ} ${circ}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dasharray 0.6s ease" }}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fontSize: size * 0.26, fontWeight: 700, fill: color }}
      >
        {value}
      </text>
    </svg>
  );
}

/** Concentric rings (Hostinger "plan resource usage" style). */
export function MultiRing({ rings, size = 132 }: { rings: Ring[]; size?: number }) {
  const stroke = 9;
  const gap = 4;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {rings.map((ring, i) => {
        const r = (size - stroke) / 2 - i * (stroke + gap);
        if (r <= 0) return null;
        const circ = 2 * Math.PI * r;
        const frac = ring.max > 0 ? Math.min(1, ring.value / ring.max) : 0;
        return (
          <g key={ring.label}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eef2f7" strokeWidth={stroke} />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={ring.color}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`${frac * circ} ${circ}`}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              style={{ transition: "stroke-dasharray 0.6s ease" }}
            />
          </g>
        );
      })}
    </svg>
  );
}

/** Smooth area + line chart with gridlines and axis labels (CPU/Memory style). */
export function AreaLineChart({
  data,
  color = "#7c3aed",
  unit = "",
}: {
  data: Datum[];
  color?: string;
  unit?: string;
}) {
  const W = 480;
  const H = 180;
  const padL = 44;
  const padB = 22;
  const padT = 10;
  const max = Math.max(1, ...data.map((d) => d.value));
  const niceMax = Math.ceil(max / 4) * 4 || 4;
  const plotW = W - padL - 10;
  const plotH = H - padB - padT;

  const pts = data.map((d, i) => {
    const x = padL + (data.length === 1 ? plotW / 2 : (i / (data.length - 1)) * plotW);
    const y = padT + plotH - (d.value / niceMax) * plotH;
    return { x, y };
  });

  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const area =
    pts.length > 0
      ? `${line} L${pts[pts.length - 1].x},${padT + plotH} L${pts[0].x},${padT + plotH} Z`
      : "";

  const gridYs = [0, 0.25, 0.5, 0.75, 1];
  const gid = `g-${color.replace("#", "")}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.22} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* gridlines + y labels */}
      {gridYs.map((g) => {
        const y = padT + plotH - g * plotH;
        return (
          <g key={g}>
            <line x1={padL} y1={y} x2={W - 10} y2={y} stroke="#eef2f7" strokeWidth={1} />
            <text x={padL - 6} y={y} textAnchor="end" dominantBaseline="central" style={{ fontSize: 9, fill: "#94a3b8" }}>
              {Math.round(niceMax * g)}{unit}
            </text>
          </g>
        );
      })}

      {data.length > 0 && (
        <>
          <path d={area} fill={`url(#${gid})`} />
          <path d={line} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
          {pts.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={2.5} fill={color} />
          ))}
        </>
      )}

      {/* x labels */}
      {data.map((d, i) => {
        const x = padL + (data.length === 1 ? plotW / 2 : (i / (data.length - 1)) * plotW);
        return (
          <text key={i} x={x} y={H - 6} textAnchor="middle" style={{ fontSize: 9, fill: "#94a3b8" }}>
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}

/** Donut chart with legend. */
export function DonutChart({ data }: { data: DonutDatum[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = 56;
  const stroke = 20;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="flex items-center gap-6">
      <svg width="150" height="150" viewBox="0 0 150 150">
        <circle cx="75" cy="75" r={r} fill="none" stroke="#eef2f7" strokeWidth={stroke} />
        {total > 0 &&
          data.map((d) => {
            const len = (d.value / total) * circ;
            const seg = (
              <circle
                key={d.label}
                cx="75"
                cy="75"
                r={r}
                fill="none"
                stroke={d.color}
                strokeWidth={stroke}
                strokeDasharray={`${len} ${circ - len}`}
                strokeDashoffset={-offset}
                transform="rotate(-90 75 75)"
              />
            );
            offset += len;
            return seg;
          })}
        <text x="75" y="75" textAnchor="middle" dominantBaseline="central" style={{ fontSize: 26, fontWeight: 700, fill: "#111827" }}>
          {total}
        </text>
      </svg>
      <ul className="space-y-2">
        {data.map((d) => (
          <li key={d.label} className="flex items-center gap-2 text-sm">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="text-gray-600">{d.label}</span>
            <span className="ml-auto font-semibold text-gray-900">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
