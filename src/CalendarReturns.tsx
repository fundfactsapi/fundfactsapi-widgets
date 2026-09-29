import { Caption, Label, col, fmtPct, row } from "./primitives";
import { tokens } from "./theme";
import type { CalendarReturnsData } from "./types";

export interface CalendarReturnsProps extends CalendarReturnsData {
  height?: number;
  /** Draw the benchmark as a thinner bar next to the fund when available (default true). */
  showBenchmark?: boolean;
  /** Label for the benchmark legend. */
  benchmarkLabel?: string;
  /** Label for the fund legend (default "Fund"). */
  fundLabel?: string;
  /** BCP 47 locale for the value labels ("fr-FR" → "12,5 %"). */
  locale?: string;
  /** Caption when no years are disclosed. */
  emptyLabel?: string;
  /** Prefix of the chart's accessible name (default "Calendar-year returns"). */
  ariaLabel?: string;
}

const W = 400;
const LABEL = 14;
const PAD = { top: 20, right: 6, bottom: 22, left: 6 };

/** Calendar-year total returns as a bar chart, with value labels that never collide with the axis. */
export function CalendarReturns({ years, fund, benchmark, height = 200, showBenchmark = true, benchmarkLabel = "Index", fundLabel = "Fund", locale, emptyLabel = "No calendar returns disclosed.", ariaLabel = "Calendar-year returns" }: CalendarReturnsProps) {
  const n = years?.length ?? 0;
  if (!n) return <Caption>{emptyLabel}</Caption>;
  const bench = showBenchmark && benchmark?.some((v) => v != null) ? benchmark : null;
  const vals = [...fund, ...(bench ?? [])].filter((v): v is number => v != null && Number.isFinite(v));
  const max = Math.max(0, ...vals);
  const min = Math.min(0, ...vals);
  const ih = height - PAD.top - PAD.bottom - LABEL;
  const iw = W - PAD.left - PAD.right;
  const scale = ih / (max - min || 1);
  const zeroY = PAD.top + max * scale;
  const slot = iw / n;
  const barW = Math.min(34, slot * (bench ? 0.34 : 0.55));

  const bar = (v: number | null | undefined, cx: number, w: number, color: string, label: boolean) => {
    if (v == null) return null;
    const h = Math.abs(v) * scale;
    const yTop = v >= 0 ? zeroY - h : zeroY;
    // Value label sits just outside the bar end; the bottom padding reserves room so it never meets the year axis.
    const ly = v >= 0 ? yTop - 5 : yTop + h + 11;
    return (
      <g>
        <rect x={cx - w / 2} y={yTop} width={w} height={Math.max(1.5, h)} rx="3" fill={color} />
        {label ? (
          <text x={cx} y={ly} fontSize="10.5" textAnchor="middle" fontWeight="600" fill={tokens.text} style={{ fontVariantNumeric: "tabular-nums", fontFamily: tokens.font }}>
            {fmtPct(v, 1, true, locale)}
          </text>
        ) : null}
      </g>
    );
  };

  return (
    <div style={col(8)}>
      <svg viewBox={`0 0 ${W} ${height}`} width="100%" height="auto" role="img" aria-label={`${ariaLabel}: ${years.map((y, i) => `${y} ${fmtPct(fund[i], 1, true, locale)}`).join(", ")}`} style={{ display: "block", overflow: "visible", fontFamily: tokens.font }}>
        <line x1={PAD.left} x2={W - PAD.right} y1={zeroY} y2={zeroY} stroke={tokens.borderStrong} />
        {years.map((yr, i) => {
          const cx = PAD.left + slot * i + slot / 2;
          const v = fund[i];
          const b = bench?.[i];
          const gap = bench ? barW * 0.15 : 0;
          return (
            <g key={yr}>
              {bar(v, bench ? cx - barW / 2 - gap : cx, barW, v != null && v < 0 ? tokens.negative : tokens.positive, true)}
              {bench ? bar(b, cx + barW / 2 + gap, barW * 0.8, tokens.borderStrong, false) : null}
              <text x={cx} y={height - 6} fontSize="11" textAnchor="middle" fill={tokens.muted}>
                {yr}
              </text>
            </g>
          );
        })}
      </svg>
      {bench ? (
        <div style={row(14)}>
          <Label style={row(6)}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: tokens.positive }} /> {fundLabel}
          </Label>
          <Label style={row(6)}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: tokens.borderStrong }} /> {benchmarkLabel}
          </Label>
        </div>
      ) : null}
    </div>
  );
}
