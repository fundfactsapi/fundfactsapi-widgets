import { StatTiles, type Stat } from "./StatTiles";
import type { FundDataLike } from "./types";

export interface KeyFactsProps {
  data: FundDataLike;
  /** Which tiles, in order. Defaults to TER, fund size, inception, holdings, currency, distribution, benchmark. */
  fields?: Array<"ter" | "aum" | "inception" | "holdings" | "currency" | "distribution" | "benchmark" | "manager" | "assetClass" | "sfdr">;
  minWidth?: number;
  columns?: number;
}

/** The factsheet header block from `data.keyFacts` + `data.headlineMetrics`. Empty fields are skipped. */
export function KeyFacts({ data, fields = ["ter", "aum", "inception", "holdings", "currency", "distribution"], minWidth = 110, columns }: KeyFactsProps) {
  const k = data.keyFacts ?? {};
  const all: Record<NonNullable<KeyFactsProps["fields"]>[number], Stat> = {
    ter: { label: "TER", value: data.headlineMetrics?.ter, tone: "teal" },
    aum: { label: "Fund size", value: k.aum ?? data.headlineMetrics?.aum, tone: "blue" },
    inception: { label: "Inception", value: k.inception },
    holdings: { label: "Holdings", value: k.holdings },
    currency: { label: "Currency", value: k.currency },
    distribution: { label: "Distribution", value: k.distribution },
    benchmark: { label: "Benchmark", value: data.benchmarkName },
    manager: { label: "Manager", value: k.manager },
    assetClass: { label: "Asset class", value: k.assetClass },
    sfdr: { label: "SFDR", value: data.sfdrArticle ? `Article ${data.sfdrArticle}` : null, tone: "green" },
  };
  return <StatTiles stats={fields.map((f) => all[f])} minWidth={minWidth} columns={columns} />;
}

export interface RiskMetricsProps {
  data: FundDataLike;
  minWidth?: number;
}

/** Volatility, Sharpe, drawdown, P/E, yields, duration… whichever the fund discloses. */
export function RiskMetrics({ data, minWidth = 110 }: RiskMetricsProps) {
  const m = data.metrics ?? {};
  const h = data.headlineMetrics ?? {};
  const stats: Stat[] = [
    { label: "Volatility 3y", value: h.volatility3y || m.volatility3y, tone: "purple" },
    { label: "Sharpe 3y", value: h.sharpe3y || m.sharpe3y, tone: "green" },
    { label: "Max drawdown", value: m.maxDrawdown, tone: "pink" },
    { label: "P/E ratio", value: m.peRatio, tone: "orange" },
    { label: "Income yield", value: m.incomeYield },
    { label: "Yield to maturity", value: h.yieldToMaturity || m.yieldToMaturity },
    { label: "Duration", value: h.modifiedDuration || m.effectiveDuration },
    { label: "Avg. rating", value: m.averageRating },
    { label: "Equity correlation", value: m.equityCorrelation },
    // A 100/0 split only restates the asset class; show it for mixed portfolios.
    { label: "Equity / bond", value: m.equityBondSplit && !/^(100 \/ 0|0 \/ 100)$/.test(m.equityBondSplit) ? m.equityBondSplit : null },
  ];
  return <StatTiles stats={stats} minWidth={minWidth} />;
}
