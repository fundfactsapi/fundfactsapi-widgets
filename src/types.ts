/**
 * Loose views of the FundFacts API payload: every widget accepts the raw
 * `data` object (or the relevant slice of it) and ignores what it does not use.
 * Full types ship with @fundfactsapi/sdk.
 */
export interface Weighted {
  label: string;
  weight: number;
}

export interface Holding {
  name: string;
  /** Percent; null when the issuer publishes the names only (then every weight of the list is null). */
  weight: number | null;
}

/** `data.indexedPerformance.points` — rebased to 100. */
export interface IndexedPoint {
  /** YYYY-MM or YYYY-MM-DD */
  date: string;
  fund: number | null;
  index?: number | null;
}

export interface AnnualisedRow {
  label: string;
  fund: number | null;
  index: number | null;
}

export interface CalendarReturnsData {
  years: string[];
  fund: (number | null)[];
  benchmark?: (number | null)[];
}

export interface FundProfileLike {
  kind?: string;
  category: string;
  /** "low" | "medium" | "high" (typed loosely so raw JSON fits). */
  riskBand?: string | null;
  /** "concentrated" | "balanced" | "diversified" */
  concentration?: string | null;
  regionFocus?: string | null;
  regionTilt?: string | null;
  sectorTilt?: string | null;
  /** "value" | "blend" | "growth" */
  valuation?: string | null;
  /** "high" | "medium" | "low" */
  creditQuality?: string | null;
  /** "limited" | "moderate" | "extensive" */
  rateSensitivity?: string | null;
  equityShare?: number | null;
  rules?: string;
}

/** The parts of `data` the widgets read. Everything is optional. */
export interface FundDataLike {
  investmentObjective?: string;
  securityType?: string;
  structure?: string;
  keyFacts?: Partial<{ assetClass: string; currency: string; aum: string; inception: string; subAsset: string; distribution: string; holdings: string | number; manager: string }>;
  riskRating?: number | null;
  profile?: FundProfileLike;
  topHoldings?: Holding[];
  /** "physical" | "synthetic" */
  replication?: string | null;
  /** "portfolio" | "substituteBasket" (a synthetic fund's collateral, not its exposure) */
  holdingsBasis?: string | null;
  sector?: Weighted[];
  geography?: Weighted[];
  region?: Weighted[];
  creditQuality?: Weighted[];
  assetAllocation?: Weighted[];
  maturity?: Weighted[];
  calendarReturns?: CalendarReturnsData;
  annualisedReturns?: AnnualisedRow[];
  indexedPerformance?: { points: IndexedPoint[]; hasIndex?: boolean };
  headlineMetrics?: Partial<{ ter: string; aum: string; volatility3y: string; sharpe3y: string; yieldToMaturity: string; modifiedDuration: string }>;
  metrics?: Partial<Record<string, string>>;
  costs?: Partial<Record<string, string>>;
  sfdrArticle?: number | null;
  benchmarkName?: string;
  dataAsOf?: string;
}

/** A fund envelope as returned by GET /api/v1/funds/{isin} (or the demo endpoint). */
export interface FundLike {
  isin: string;
  name?: string | null;
  generatedAt?: string | null;
  expiresAt?: string | null;
  cached?: boolean;
  data: FundDataLike;
}
