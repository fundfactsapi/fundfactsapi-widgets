import { Caption, Label, Num, col, niceTicks, row } from "./primitives";
import { tokens } from "./theme";
import type { IndexedPoint } from "./types";

export interface GrowthChartProps {
  /** `data.indexedPerformance.points` (rebased to 100). */
  points: IndexedPoint[];
  fundLabel?: string;
  /** e.g. `data.benchmarkName` */
  benchmarkLabel?: string;
  /** SVG height in viewBox units (width scales to the container). */
  height?: number;
  /** Hide the legend row. */
  hideLegend?: boolean;
  /** Caption when fewer than two points are usable. */
  emptyLabel?: string;
  /** Legend note (default "rebased to 100"). */
  rebasedLabel?: string;
  /** Accessible name of the chart; defaults to "Growth of 100: fund versus index from … to …". */
  ariaLabel?: string;
}

const W = 720;
const PAD = { top: 12, right: 52, bottom: 26, left: 6 };

/**
 * Id for the area gradient, derived from the series itself. No `useId`: hooks
 * need a live React renderer, and the chart is also rendered to static markup
 * from Next.js route handlers, where `react` resolves to the React Server build
 * whose hook dispatcher is null. A content hash is the same on the server and
 * the client, so hydration stays consistent, and two charts of the same series
 * sharing one gradient definition is harmless (the definitions are identical).
 */
function gradientId(points: IndexedPoint[]): string {
  let h = 5381;
  for (const p of points) {
    const s = `${p.date}|${p.fund}|${p.index ?? ""}`;
    for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
  }
  return `ffgrad${h.toString(36)}`;
}

/** "Growth of 100" line chart, fund versus benchmark, as responsive SVG. */
export function GrowthChart({ points, fundLabel = "Fund", benchmarkLabel = "Index", height = 280, hideLegend, emptyLabel = "No performance series for this fund.", rebasedLabel = "rebased to 100", ariaLabel }: GrowthChartProps) {
  const usable = (points ?? []).filter((p) => p && p.fund != null && Number.isFinite(p.fund));
  const gradId = gradientId(usable);
  if (usable.length < 2) return <Caption>{emptyLabel}</Caption>;
  const hasIndex = usable.some((p) => p.index != null);

  const vals = usable.flatMap((p) => [p.fund as number, ...(p.index != null ? [p.index] : [])]);
  const lo = Math.min(...vals);
  const hi = Math.max(...vals);
  const pad = (hi - lo) * 0.06 || 1;
  const min = lo - pad;
  const max = hi + pad;
  const ticks = niceTicks(min, max, 4);
  const iw = W - PAD.left - PAD.right;
  const ih = height - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (i / (usable.length - 1)) * iw;
  const y = (v: number) => PAD.top + ih - ((v - min) / (max - min)) * ih;
  const pathOf = (pick: (p: IndexedPoint) => number | null | undefined) =>
    usable
      .map((p, i) => {
        const v = pick(p);
        return v == null ? null : `${i === 0 || pick(usable[i - 1]) == null ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`;
      })
      .filter(Boolean)
      .join(" ");
  const fundPath = pathOf((p) => p.fund);
  const indexPath = hasIndex ? pathOf((p) => p.index) : "";
  const baseY = (PAD.top + ih).toFixed(1);
  const areaPath = `${fundPath} L${x(usable.length - 1).toFixed(1)},${baseY} L${PAD.left},${baseY} Z`;

  // Year ticks: spread ~6 labels across the series, on January when the data is monthly.
  const years = usable.map((p) => p.date.slice(0, 4));
  const firstYear = Number(years[0]);
  const lastYear = Number(years[years.length - 1]);
  const every = Math.max(1, Math.ceil((lastYear - firstYear) / 6));
  const xTicks: { i: number; label: string }[] = [];
  usable.forEach((p, i) => {
    const yr = Number(years[i]);
    if ((i === 0 || years[i - 1] !== years[i]) && (yr - firstYear) % every === 0 && i > 0) xTicks.push({ i, label: String(yr) });
  });

  const first = usable[0];
  const last = usable[usable.length - 1];

  return (
    <div style={col(10)}>
      <svg viewBox={`0 0 ${W} ${height}`} width="100%" height="auto" role="img" aria-label={ariaLabel ?? `Growth of 100: ${fundLabel} versus ${benchmarkLabel} from ${first.date} to ${last.date}`} style={{ display: "block", overflow: "visible", fontFamily: tokens.font }}>
        <defs>
          <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={tokens.accent} stopOpacity="0.22" />
            <stop offset="100%" stopColor={tokens.accent} stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((v) => (
          <g key={v}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(v)} y2={y(v)} stroke={tokens.border} strokeDasharray="2 4" />
            <text x={W - PAD.right + 8} y={y(v) + 4} fontSize="11" fill={tokens.muted} style={{ fontVariantNumeric: "tabular-nums" }}>
              {v}
            </text>
          </g>
        ))}
        {xTicks.map((t) => (
          <text key={t.label} x={x(t.i)} y={height - 8} fontSize="11" textAnchor="middle" fill={tokens.muted}>
            {t.label}
          </text>
        ))}
        <path d={areaPath} fill={`url(#${gradId})`} />
        {indexPath ? <path d={indexPath} fill="none" stroke={tokens.benchmark} strokeWidth="1.6" strokeDasharray="4 3" strokeLinejoin="round" /> : null}
        <path d={fundPath} fill="none" stroke={tokens.accent} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={x(usable.length - 1)} cy={y(last.fund as number)} r="4.5" fill={tokens.accent} stroke={tokens.surface} strokeWidth="2" />
      </svg>
      {hideLegend ? null : (
        <div style={row(18, { flexWrap: "wrap", justifyContent: "space-between" })}>
          <div style={row(18, { flexWrap: "wrap" })}>
            <Legend color={tokens.accent} label={fundLabel} value={last.fund as number} />
            {hasIndex && last.index != null ? <Legend color={tokens.benchmark} label={benchmarkLabel} value={last.index} dashed /> : null}
          </div>
          <Label>
            {first.date.slice(0, 7)} → {last.date.slice(0, 7)} · {rebasedLabel}
          </Label>
        </div>
      )}
    </div>
  );
}

function Legend({ color, label, value, dashed }: { color: string; label: string; value: number; dashed?: boolean }) {
  return (
    <span style={row(8)}>
      <svg width="22" height="8" aria-hidden="true">
        <line x1="0" x2="22" y1="4" y2="4" stroke={color} strokeWidth="2.4" strokeDasharray={dashed ? "4 3" : undefined} />
      </svg>
      <Label style={{ color: tokens.text }}>{label}</Label>
      <Num>{Math.round(value)}</Num>
    </span>
  );
}
