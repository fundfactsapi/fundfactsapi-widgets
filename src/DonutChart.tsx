import { Caption, Label, Num, col, fmtWeight, row, truncate } from "./primitives";
import { colorAt, otherColor, tokens } from "./theme";
import type { Weighted } from "./types";

export interface DonutChartProps {
  /** Any `{ label, weight }` breakdown: `data.sector`, `data.assetAllocation`, `data.creditQuality`… */
  items: Weighted[];
  /** Slices shown before the rest is grouped as "Other" (default 7). */
  max?: number;
  /** Text in the middle; defaults to the largest slice. */
  center?: { value: string; label: string } | null;
  size?: number;
  /** Legend on the right (default) or below. */
  legend?: "side" | "below" | "none";
}

/** Donut with a legend. Slices beyond `max` are grouped into "Other". */
export function DonutChart({ items, max = 7, center, size = 160, legend = "side" }: DonutChartProps) {
  const clean = (items ?? []).filter((i) => i && typeof i.weight === "number" && i.weight > 0).sort((a, b) => b.weight - a.weight);
  if (!clean.length) return <Caption>No breakdown disclosed.</Caption>;
  const shown = clean.slice(0, max);
  const rest = clean.slice(max).reduce((s, i) => s + i.weight, 0);
  const total = clean.reduce((s, i) => s + i.weight, 0);
  const parts = [...shown, ...(rest > 0.05 ? [{ label: "Other", weight: rest }] : [])];
  const missing = Math.max(0, 100 - total);
  const scale = total > 100 ? 100 / total : 1;

  const r = 44;
  const c = 2 * Math.PI * r;
  let offset = 0;
  const arcs = parts.map((p, i) => {
    const len = ((p.weight * scale) / 100) * c;
    const arc = { ...p, len, offset, color: p.label === "Other" ? otherColor : colorAt(i) };
    offset += len;
    return arc;
  });
  // The hole fits about 14 characters; a longer label is dropped rather than truncated mid-word.
  const mid = center === undefined ? { value: fmtWeight(parts[0].weight, 0), label: parts[0].label.length <= 14 ? parts[0].label : "" } : center;

  const svg = (
    <svg width={size} height={size} viewBox="0 0 120 120" role="img" aria-label={`Breakdown: ${parts.map((p) => `${p.label} ${fmtWeight(p.weight)}`).join(", ")}`} style={{ flexShrink: 0, display: "block" }}>
      <circle cx="60" cy="60" r={r} fill="none" stroke={tokens.track} strokeWidth="15" />
      {arcs.map((a) => (
        <circle key={a.label} cx="60" cy="60" r={r} fill="none" stroke={a.color} strokeWidth="15" strokeDasharray={`${Math.max(0, a.len - 1.2)} ${c}`} strokeDashoffset={-a.offset} transform="rotate(-90 60 60)" />
      ))}
      {mid ? (
        <>
          <text x="60" y={mid.label ? 57 : 65} textAnchor="middle" fontSize="17" fontWeight="700" fill={tokens.text} style={{ fontVariantNumeric: "tabular-nums", fontFamily: tokens.font }}>
            {mid.value}
          </text>
          {mid.label ? (
            <text x="60" y="72" textAnchor="middle" fontSize="7.5" fill={tokens.muted} style={{ fontFamily: tokens.font }}>
              {truncate(mid.label, 16)}
            </text>
          ) : null}
        </>
      ) : null}
    </svg>
  );
  if (legend === "none") return svg;

  const list = (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, ...col(6), flex: 1, minWidth: 150 }}>
      {arcs.map((a) => (
        <li key={a.label} style={row(8, { justifyContent: "space-between" })}>
          <span style={row(8, { minWidth: 0 })}>
            <span aria-hidden="true" style={{ width: 10, height: 10, borderRadius: 3, background: a.color, flexShrink: 0 }} />
            <Label style={{ color: tokens.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.label}</Label>
          </span>
          <Num>{fmtWeight(a.weight)}</Num>
        </li>
      ))}
      {missing > 0.5 ? (
        <li>
          <Label style={{ color: tokens.faint }}>{fmtWeight(missing)} not disclosed</Label>
        </li>
      ) : null}
    </ul>
  );
  return legend === "below" ? (
    <div style={col(14, { alignItems: "center" })}>
      {svg}
      {list}
    </div>
  ) : (
    <div style={row(20, { alignItems: "center", flexWrap: "wrap" })}>
      {svg}
      {list}
    </div>
  );
}
