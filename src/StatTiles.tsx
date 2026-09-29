import { Caption, Label, col } from "./primitives";
import { tokens, tones, type Tone } from "./theme";

export interface Stat {
  label: string;
  value: string | number | null | undefined;
  hint?: string;
  tone?: Tone;
}

export interface StatTilesProps {
  stats: Stat[];
  /** Minimum tile width in px (default 120). */
  minWidth?: number;
  /** Drop tiles whose value is empty (default true). */
  hideEmpty?: boolean;
  /** Fixed column count instead of auto-fit. */
  columns?: number;
  /** Caption when every value is empty (default "No figures disclosed."). */
  emptyLabel?: string;
}

const isEmpty = (v: Stat["value"]) => v == null || v === "" || v === "—";

/** Compact metric tiles for key facts and risk statistics. Empty values are hidden by default. */
export function StatTiles({ stats, minWidth = 120, hideEmpty = true, columns, emptyLabel = "No figures disclosed." }: StatTilesProps) {
  const shown = hideEmpty ? stats.filter((s) => !isEmpty(s.value)) : stats;
  if (!shown.length) return <Caption>{emptyLabel}</Caption>;
  return (
    <div style={{ display: "grid", gridTemplateColumns: columns ? `repeat(${columns}, minmax(0, 1fr))` : `repeat(auto-fit, minmax(${minWidth}px, 1fr))`, gap: 8 }}>
      {shown.map((s) => {
        const tone = s.tone ? tones[s.tone] : tones.neutral;
        return (
          <div key={s.label} style={{ ...col(3), padding: "10px 12px", borderRadius: tokens.radius, background: tone.bg, border: s.tone ? "1px solid transparent" : `1px solid ${tokens.border}` }}>
            <Label style={{ color: s.tone ? tone.fg : tokens.muted, opacity: s.tone ? 0.85 : 1 }}>{s.label}</Label>
            <span style={{ fontSize: 17, lineHeight: 1.2, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: s.tone ? tone.fg : tokens.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {isEmpty(s.value) ? "—" : String(s.value)}
            </span>
            {s.hint ? <Label style={{ color: s.tone ? tone.fg : tokens.faint, opacity: 0.8 }}>{s.hint}</Label> : null}
          </div>
        );
      })}
    </div>
  );
}
