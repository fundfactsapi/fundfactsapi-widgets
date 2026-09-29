import { Caption, Label, Num, col, fmtWeight, row } from "./primitives";
import { tokens } from "./theme";
import type { Holding, Weighted } from "./types";

export interface WeightBarsProps {
  /**
   * `data.topHoldings` (`{ name, weight }`) or any `{ label, weight }` breakdown.
   * Holdings published as names only (every weight null) are listed without
   * bars or percentages.
   */
  items: Array<Weighted | Holding>;
  /** Rows shown (default 10). */
  max?: number;
  /** Bar colour; defaults to the accent. */
  color?: string;
  /** Scale bars to this weight instead of the largest item (e.g. 100 for absolute). */
  scaleTo?: number;
  /** Show 01, 02… rank numbers. */
  ranked?: boolean;
  /** Decimal places for the value (default 2). */
  digits?: number;
  /** BCP 47 locale for the numbers ("fr-FR" → "12,5 %"); plain "12.5%" without. */
  locale?: string;
  /** Caption when nothing is disclosed (default "Nothing disclosed."). */
  emptyLabel?: string;
  /** "+ N more" line under a truncated list. */
  moreLabel?: (n: number) => string;
  /** Note under holdings published without weights. */
  weightsNotPublishedLabel?: string;
}

const labelOf = (i: Weighted | Holding) => ("label" in i ? i.label : i.name);
const hasWeight = (i: Weighted | Holding | null | undefined): i is (Weighted | Holding) & { weight: number } =>
  !!i && typeof i.weight === "number" && Number.isFinite(i.weight);

/** Horizontal weight bars — holdings, countries, sectors, credit buckets. */
export function WeightBars({ items, max = 10, color = tokens.accent, scaleTo, ranked, digits = 2, locale, emptyLabel = "Nothing disclosed.", moreLabel = (n) => `+ ${n} more`, weightsNotPublishedLabel = "Weights not published by the issuer." }: WeightBarsProps) {
  const clean = (items ?? []).filter(hasWeight);
  if (!clean.length) {
    // Names published without weights: a ranked list, no bar, no percentage.
    const names = (items ?? []).filter((i) => i && i.weight == null && labelOf(i));
    if (!names.length) return <Caption>{emptyLabel}</Caption>;
    const shownNames = names.slice(0, max);
    return (
      <div style={col(9)}>
        <ol style={{ listStyle: "none", margin: 0, padding: 0, ...col(9) }}>
          {shownNames.map((it, i) => (
            <li key={`${labelOf(it)}-${i}`} style={row(8, { minWidth: 0 })}>
              {ranked ? (
                <Label style={{ fontVariantNumeric: "tabular-nums", color: tokens.faint, width: 18 }}>{String(i + 1).padStart(2, "0")}</Label>
              ) : null}
              <Label style={{ color: tokens.text, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{labelOf(it)}</Label>
            </li>
          ))}
        </ol>
        {names.length > shownNames.length ? <Label style={{ color: tokens.faint }}>{moreLabel(names.length - shownNames.length)}</Label> : null}
        <Label style={{ color: tokens.faint }}>{weightsNotPublishedLabel}</Label>
      </div>
    );
  }
  const shown = clean.slice(0, max);
  const top = scaleTo ?? Math.max(...shown.map((i) => i.weight), 0.0001);
  const hidden = clean.length - shown.length;
  return (
    <div style={col(9)}>
      <ol style={{ listStyle: "none", margin: 0, padding: 0, ...col(9) }}>
        {shown.map((it, i) => (
          <li key={`${labelOf(it)}-${i}`} style={col(4)}>
            <div style={row(10, { justifyContent: "space-between" })}>
              <span style={row(8, { minWidth: 0 })}>
                {ranked ? (
                  <Label style={{ fontVariantNumeric: "tabular-nums", color: tokens.faint, width: 18 }}>{String(i + 1).padStart(2, "0")}</Label>
                ) : null}
                <Label style={{ color: tokens.text, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{labelOf(it)}</Label>
              </span>
              <Num>{fmtWeight(it.weight, digits, locale)}</Num>
            </div>
            <div aria-hidden="true" style={{ height: 6, borderRadius: 999, background: tokens.track, overflow: "hidden" }}>
              <div style={{ width: `${Math.min(100, (it.weight / top) * 100)}%`, height: "100%", borderRadius: 999, background: color, opacity: 1 - Math.min(0.5, i * 0.045) }} />
            </div>
          </li>
        ))}
      </ol>
      {hidden > 0 ? <Label style={{ color: tokens.faint }}>{moreLabel(hidden)}</Label> : null}
    </div>
  );
}
