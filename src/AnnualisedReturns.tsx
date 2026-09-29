import { Caption, Label, Num, fmtPct } from "./primitives";
import { tokens } from "./theme";
import type { AnnualisedRow } from "./types";

export interface AnnualisedReturnsProps {
  /** `data.annualisedReturns` */
  rows: AnnualisedRow[];
  /** Header label for the index column. */
  indexLabel?: string;
  /** Show the fund − index difference column when an index is present (default true). */
  showDiff?: boolean;
  /** Column headers (default "Period", "Fund", "Diff"). */
  periodLabel?: string;
  fundLabel?: string;
  diffLabel?: string;
  /** BCP 47 locale for the values ("fr-FR" → "12,50 %"). */
  locale?: string;
  /** Caption when no row is disclosed. */
  emptyLabel?: string;
}

/** Trailing annualised returns versus the index, as a compact table. */
export function AnnualisedReturns({ rows, indexLabel = "Index", showDiff = true, periodLabel = "Period", fundLabel = "Fund", diffLabel = "Diff", locale, emptyLabel = "No annualised returns disclosed." }: AnnualisedReturnsProps) {
  const clean = (rows ?? []).filter((r) => r && (r.fund != null || r.index != null));
  if (!clean.length) return <Caption>{emptyLabel}</Caption>;
  const hasIndex = clean.some((r) => r.index != null);
  const cell = (align: "left" | "right" = "right") => ({ padding: "8px 0", textAlign: align, borderTop: `1px solid ${tokens.border}`, whiteSpace: "nowrap" as const });
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: tokens.font }}>
      <thead>
        <tr>
          <th style={{ ...cell("left"), borderTop: 0, paddingTop: 0 }}>
            <Label>{periodLabel}</Label>
          </th>
          <th style={{ ...cell(), borderTop: 0, paddingTop: 0 }}>
            <Label>{fundLabel}</Label>
          </th>
          {hasIndex ? (
            <th style={{ ...cell(), borderTop: 0, paddingTop: 0 }}>
              <Label>{indexLabel}</Label>
            </th>
          ) : null}
          {hasIndex && showDiff ? (
            <th style={{ ...cell(), borderTop: 0, paddingTop: 0 }}>
              <Label>{diffLabel}</Label>
            </th>
          ) : null}
        </tr>
      </thead>
      <tbody>
        {clean.map((r) => {
          const diff = r.fund != null && r.index != null ? r.fund - r.index : null;
          return (
            <tr key={r.label}>
              <td style={cell("left")}>
                <Label style={{ color: tokens.text, fontWeight: 500 }}>{r.label}</Label>
              </td>
              <td style={cell()}>
                <Num color={r.fund != null && r.fund < 0 ? tokens.negative : undefined}>{fmtPct(r.fund, 2, true, locale)}</Num>
              </td>
              {hasIndex ? (
                <td style={cell()}>
                  <Num color={tokens.muted} style={{ fontWeight: 500 }}>{fmtPct(r.index, 2, true, locale)}</Num>
                </td>
              ) : null}
              {hasIndex && showDiff ? (
                <td style={cell()}>
                  <Num color={diff == null ? tokens.faint : diff >= 0 ? tokens.positive : tokens.negative}>{diff == null ? "—" : fmtPct(diff, 2, true, locale)}</Num>
                </td>
              ) : null}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
