import { Label, col, row } from "./primitives";
import { tokens } from "./theme";

export interface RiskScaleProps {
  /** `data.riskRating` — SRRI / SRI, 1 (lowest) to 7 (highest). */
  value: number | null | undefined;
  /** Show the "Lower risk / Higher risk" caption row (default true). */
  captions?: boolean;
  /** Caption under the first level (default "Lower risk · lower reward"). */
  lowerLabel?: string;
  /** Caption under the last level (default "Higher risk · higher reward"). */
  higherLabel?: string;
  /** Accessible name of the scale; defaults to "Risk indicator N of 7". */
  ariaLabel?: string;
}

const LEVELS = [1, 2, 3, 4, 5, 6, 7] as const;
const COLORS = [
  "var(--ff-risk-1, #2FB36B)",
  "var(--ff-risk-2, #57BF5A)",
  "var(--ff-risk-3, #9BC53D)",
  "var(--ff-risk-4, #E8B923)",
  "var(--ff-risk-5, #F0902D)",
  "var(--ff-risk-6, #E5573B)",
  "var(--ff-risk-7, #C42B47)",
];

/** The regulatory 1–7 risk ladder (SRRI / SRI). */
export function RiskScale({ value, captions = true, lowerLabel = "Lower risk · lower reward", higherLabel = "Higher risk · higher reward", ariaLabel }: RiskScaleProps) {
  const active = value != null && value >= 1 && value <= 7 ? Math.round(value) : null;
  return (
    <div style={col(8)} role="img" aria-label={ariaLabel ?? (active ? `Risk indicator ${active} of 7` : "Risk indicator not disclosed")}>
      <div style={row(4, { alignItems: "flex-end" })}>
        {LEVELS.map((lvl) => {
          const on = lvl === active;
          const past = active != null && lvl < active;
          return (
            <div
              key={lvl}
              style={{
                flex: 1,
                height: on ? 42 : 30,
                borderRadius: 8,
                background: on ? COLORS[lvl - 1] : tokens.track,
                boxShadow: on ? `0 0 0 3px ${tokens.surface}, 0 0 0 4px ${COLORS[lvl - 1]}` : undefined,
                display: "grid",
                placeItems: "center",
                color: on ? "#fff" : past ? tokens.text : tokens.faint,
                fontWeight: on ? 700 : 500,
                fontSize: on ? 16 : 12,
                fontVariantNumeric: "tabular-nums",
                position: "relative",
              }}
            >
              {lvl}
              {past ? <span aria-hidden="true" style={{ position: "absolute", inset: 0, borderRadius: 8, background: COLORS[lvl - 1], opacity: 0.18 }} /> : null}
            </div>
          );
        })}
      </div>
      {captions ? (
        <div style={row(8, { justifyContent: "space-between" })}>
          <Label>{lowerLabel}</Label>
          <Label>{higherLabel}</Label>
        </div>
      ) : null}
    </div>
  );
}
