import type { CSSProperties } from "react";
import { AnnualisedReturns } from "./AnnualisedReturns";
import { CalendarReturns } from "./CalendarReturns";
import { DonutChart } from "./DonutChart";
import { FreshnessDial } from "./FreshnessDial";
import { GrowthChart } from "./GrowthChart";
import { KeyFacts, RiskMetrics } from "./KeyFacts";
import { Caption, WidgetCard, col, row } from "./primitives";
import { ProfileChips } from "./ProfileChips";
import { RiskScale } from "./RiskScale";
import { tokens } from "./theme";
import type { FundLike } from "./types";
import { WeightBars } from "./WeightBars";

export interface FundFactsheetProps {
  /** The envelope from GET /api/v1/funds/{isin} (or the demo endpoint). */
  fund: FundLike;
  /** Show the fund name / ISIN header (default true). */
  header?: boolean;
  /** Show the freshness card (default false). */
  freshness?: boolean;
  /** Show the JSON path tag on each card (default false). */
  paths?: boolean;
  style?: CSSProperties;
  className?: string;
}

/**
 * A complete factsheet from one API response: cards appear only when the fund
 * discloses the data, and every card sizes to its content (no dead space).
 */
export function FundFactsheet({ fund, header = true, freshness = false, paths = false, style, className }: FundFactsheetProps) {
  const d = fund.data ?? {};
  const tag = (p: string) => (paths ? p : undefined);
  const series = d.indexedPerformance?.points ?? [];
  const hasSeries = series.filter((p) => p.fund != null).length >= 2;
  const hasCalendar = Boolean(d.calendarReturns?.years?.length);
  const hasAnnualised = Boolean(d.annualisedReturns?.some((r) => r.fund != null || r.index != null));
  const grid: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, alignItems: "stretch" };
  const span2: CSSProperties = { gridColumn: "span 2" };

  return (
    <div className={className} style={{ ...col(16), fontFamily: tokens.font, color: tokens.text, ...style }}>
      {header ? (
        <div style={col(6)}>
          <div style={row(10, { flexWrap: "wrap" })}>
            <h2 style={{ margin: 0, fontSize: 22, lineHeight: 1.2, fontWeight: 700 }}>{fund.name ?? fund.isin}</h2>
            <code style={{ fontFamily: tokens.mono, fontSize: 12, color: tokens.muted, background: tokens.track, padding: "2px 8px", borderRadius: 6 }}>{fund.isin}</code>
            {d.structure ? <span style={{ fontSize: 12, color: tokens.muted, border: `1px solid ${tokens.border}`, borderRadius: 999, padding: "2px 9px" }}>{d.structure}</span> : null}
          </div>
          {d.investmentObjective ? <Caption style={{ maxWidth: 760, fontSize: 13 }}>{d.investmentObjective}</Caption> : null}
        </div>
      ) : null}

      <div style={grid}>
        {hasSeries ? (
          <WidgetCard title="Growth of 100" tag={tag("data.indexedPerformance")} style={span2}>
            <GrowthChart points={series} fundLabel="Fund" benchmarkLabel={d.benchmarkName || "Index"} />
          </WidgetCard>
        ) : null}
        <WidgetCard title="Key facts" tag={tag("data.keyFacts")}>
          <KeyFacts data={d} columns={2} />
        </WidgetCard>

        {d.topHoldings?.length ? (
          <WidgetCard title="Top holdings" tag={tag("data.topHoldings")}>
            <WeightBars items={d.topHoldings} ranked />
          </WidgetCard>
        ) : null}
        {d.sector?.length ? (
          <WidgetCard title="Sectors" tag={tag("data.sector")}>
            <DonutChart items={d.sector} />
          </WidgetCard>
        ) : null}
        {d.geography?.length ? (
          <WidgetCard title="Countries" tag={tag("data.geography")}>
            <WeightBars items={d.geography} color={tokens.benchmark} digits={1} />
          </WidgetCard>
        ) : null}
        {d.assetAllocation?.length ? (
          <WidgetCard title="Asset allocation" tag={tag("data.assetAllocation")}>
            <DonutChart items={d.assetAllocation} />
          </WidgetCard>
        ) : null}
        {d.creditQuality?.length ? (
          <WidgetCard title="Credit quality" tag={tag("data.creditQuality")}>
            <WeightBars items={d.creditQuality} digits={1} />
          </WidgetCard>
        ) : null}

        <WidgetCard title="Risk & profile" tag={tag("data.riskRating · data.profile")}>
          <div style={col(16)}>
            <RiskScale value={d.riskRating} />
            {d.profile ? <ProfileChips profile={d.profile} /> : null}
          </div>
        </WidgetCard>
        {hasCalendar ? (
          <WidgetCard title="Calendar-year returns" tag={tag("data.calendarReturns")}>
            <CalendarReturns years={d.calendarReturns!.years} fund={d.calendarReturns!.fund} benchmark={d.calendarReturns!.benchmark} benchmarkLabel={d.benchmarkName || "Index"} />
          </WidgetCard>
        ) : null}
        {hasAnnualised ? (
          <WidgetCard title="Annualised returns" tag={tag("data.annualisedReturns")}>
            <AnnualisedReturns rows={d.annualisedReturns!} />
          </WidgetCard>
        ) : null}
        <WidgetCard title="Risk & valuation metrics" tag={tag("data.metrics")} style={hasSeries ? span2 : undefined}>
          <RiskMetrics data={d} />
        </WidgetCard>
        {freshness ? (
          <WidgetCard title="Freshness" tag={tag("generatedAt · expiresAt")}>
            <FreshnessDial generatedAt={fund.generatedAt} expiresAt={fund.expiresAt} dataAsOf={d.dataAsOf} />
          </WidgetCard>
        ) : null}
      </div>
      {d.dataAsOf ? <Caption style={{ color: tokens.faint }}>Figures as of {d.dataAsOf}. Data from FundFacts API; not investment advice.</Caption> : null}
    </div>
  );
}
