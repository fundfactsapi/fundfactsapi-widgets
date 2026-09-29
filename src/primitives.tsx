import type { CSSProperties, ReactNode } from "react";
import { tokens } from "./theme";

/* Internal layout + text helpers. Inline styles only: no stylesheet to import. */

export const row = (gap = 8, extra?: CSSProperties): CSSProperties => ({ display: "flex", alignItems: "center", gap, minWidth: 0, ...extra });
export const col = (gap = 8, extra?: CSSProperties): CSSProperties => ({ display: "flex", flexDirection: "column", gap, minWidth: 0, ...extra });

export function Label({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <span style={{ fontSize: 12, lineHeight: 1.3, color: tokens.muted, letterSpacing: 0.1, ...style }}>{children}</span>;
}

export function Strong({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <span style={{ fontSize: 13, lineHeight: 1.3, color: tokens.text, fontWeight: 600, ...style }}>{children}</span>;
}

export function Num({ children, style, color }: { children: ReactNode; style?: CSSProperties; color?: string }) {
  return <span style={{ fontSize: 13, lineHeight: 1.3, fontWeight: 600, fontVariantNumeric: "tabular-nums", color: color ?? tokens.text, whiteSpace: "nowrap", ...style }}>{children}</span>;
}

export function Caption({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <p style={{ margin: 0, fontSize: 12, lineHeight: 1.45, color: tokens.muted, ...style }}>{children}</p>;
}

export interface WidgetCardProps {
  title?: ReactNode;
  /** Small monospace tag on the right of the title, e.g. the JSON path. */
  tag?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
  /** Extra content pinned to the bottom (footnotes, legends). */
  footer?: ReactNode;
}

/** Card frame shared by the composite factsheet; use it to match the look in your own layout. */
export function WidgetCard({ title, tag, description, children, footer, style, className }: WidgetCardProps) {
  return (
    <section
      className={className}
      style={{
        background: tokens.surface,
        border: `1px solid ${tokens.border}`,
        borderRadius: `calc(${tokens.radius} + 6px)`,
        padding: 20,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        gap: 14,
        fontFamily: tokens.font,
        color: tokens.text,
        ...style,
      }}
    >
      {title || tag || description ? (
        <header style={col(4)}>
          {title || tag ? (
            <div style={row(10, { justifyContent: "space-between", flexWrap: "wrap" })}>
              {title ? <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, lineHeight: 1.3, color: tokens.text }}>{title}</h3> : <span />}
              {tag ? <code style={{ fontFamily: tokens.mono, fontSize: 11.5, color: tokens.muted, background: tokens.track, padding: "2px 7px", borderRadius: 6 }}>{tag}</code> : null}
            </div>
          ) : null}
          {description ? <Caption>{description}</Caption> : null}
        </header>
      ) : null}
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
      {footer ? <footer style={{ marginTop: "auto" }}>{footer}</footer> : null}
    </section>
  );
}

/* ---------- number helpers ---------- */

/**
 * A number with `digits` decimals. Without a locale the output is the plain
 * `toFixed` form ("12.5"); with one, the locale's marks ("12,5" in fr-FR).
 */
function fmtNumber(v: number, digits: number, locale?: string): string {
  if (!locale) return v.toFixed(digits);
  try {
    return new Intl.NumberFormat(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(v);
  } catch {
    return v.toFixed(digits);
  }
}

/** French and German typography set a narrow no-break space before the percent sign. */
const pctSign = (locale?: string) => (locale && /^(fr|de)/i.test(locale) ? " %" : "%");

export function fmtPct(v: number | null | undefined, digits = 1, signed = true, locale?: string): string {
  if (v == null || Number.isNaN(v)) return "—";
  const s = fmtNumber(Math.abs(v), digits, locale);
  return `${v < 0 ? "−" : signed && v > 0 ? "+" : ""}${s}${pctSign(locale)}`;
}

export const fmtWeight = (v: number, digits = 1, locale?: string) => `${fmtNumber(v, digits, locale)}${pctSign(locale)}`;

/** Round tick values covering [min, max] with about `count` steps. */
export function niceTicks(min: number, max: number, count = 4): number[] {
  const span = max - min || 1;
  const rough = span / count;
  const mag = 10 ** Math.floor(Math.log10(rough));
  const norm = rough / mag;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * mag;
  const out: number[] = [];
  for (let v = Math.ceil(min / step) * step; v <= max + 1e-9; v += step) out.push(Number(v.toFixed(10)));
  return out;
}

export const truncate = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);
