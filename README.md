# @fundfactsapi/widgets

React components that render a [FundFacts API](https://fundfactsapi.com) response — the structured factsheet of any fund or ETF ISIN — as charts and tiles. Zero runtime dependencies, inline styles (no CSS to import), server-component safe, themeable with CSS variables, light and dark.

```bash
npm install @fundfactsapi/widgets @fundfactsapi/sdk
```

```tsx
import { FundFacts } from "@fundfactsapi/sdk";
import { FundFactsheet } from "@fundfactsapi/widgets";

const ff = new FundFacts({ apiKey: process.env.FUNDFACTS_API_KEY });
const fund = await ff.getFund("IE00B4L5Y983");

export default function Page() {
  return <FundFactsheet fund={fund} />; // growth chart, key facts, holdings, sectors, countries, risk, returns, metrics
}
```

Or compose your own layout from the parts — every widget takes the raw slice of `data` and renders nothing misleading when a field is not disclosed:

```tsx
import { GrowthChart, DonutChart, WeightBars, KeyFacts, RiskScale, ProfileChips, CalendarReturns, AnnualisedReturns, RiskMetrics, FreshnessDial, WidgetCard } from "@fundfactsapi/widgets";

const d = fund.data;
<WidgetCard title="Growth of 100"><GrowthChart points={d.indexedPerformance.points} benchmarkLabel={d.benchmarkName} /></WidgetCard>
<WidgetCard title="Sectors"><DonutChart items={d.sector} /></WidgetCard>
<WidgetCard title="Top holdings"><WeightBars items={d.topHoldings} ranked /></WidgetCard>
<WidgetCard title="Key facts"><KeyFacts data={d} /></WidgetCard>
<WidgetCard title="Risk"><RiskScale value={d.riskRating} /><ProfileChips profile={d.profile} /></WidgetCard>
<WidgetCard title="Calendar returns"><CalendarReturns {...d.calendarReturns} /></WidgetCard>
<WidgetCard title="Annualised"><AnnualisedReturns rows={d.annualisedReturns} /></WidgetCard>
<WidgetCard title="Risk metrics"><RiskMetrics data={d} /></WidgetCard>
```

| Component | Reads | Notes |
|---|---|---|
| `FundFactsheet` | the whole envelope | Responsive card grid; cards appear only when the fund discloses the data |
| `GrowthChart` | `data.indexedPerformance.points`, `data.benchmarkName` | Fund vs index, round axis ticks, responsive SVG |
| `DonutChart` | any `{ label, weight }` array | Groups small slices into "Other", legend side / below |
| `WeightBars` | `data.topHoldings`, `data.geography`, … | Ranked bars, "+N more"; holdings published without weights (`weight: null`) are listed by name, no bar |
| `KeyFacts` / `RiskMetrics` / `StatTiles` | `data.keyFacts`, `data.headlineMetrics`, `data.metrics` | Tinted tiles; empty values are hidden |
| `RiskScale` | `data.riskRating` | The 1–7 SRRI ladder |
| `ProfileChips` | `data.profile` | Category, risk band, concentration, tilts, valuation, credit, duration |
| `CalendarReturns` | `data.calendarReturns` | Bars with benchmark, labels never collide with the axis |
| `AnnualisedReturns` | `data.annualisedReturns` | Fund / index / difference table |
| `FreshnessDial` | `generatedAt`, `expiresAt`, `data.dataAsOf` | 24-hour life of the payload |

## Labels and locale

Every visible word is a prop with an English default, so a page in another language passes its own: `emptyLabel` on the charts, bars and tiles, `lowerLabel` / `higherLabel` / `ariaLabel` on `RiskScale`, `fundLabel` / `periodLabel` / `diffLabel` on the returns tables, `rebasedLabel` on `GrowthChart`, `moreLabel` and `weightsNotPublishedLabel` on `WeightBars`, and `labels` + `translate(field, value)` on `ProfileChips` for the chip captions and the enumerated values. Pass a BCP 47 `locale` ("fr-FR", "de-DE") to `WeightBars`, `CalendarReturns` and `AnnualisedReturns` to get the locale's decimal marks and percent sign ("12,5 %"); without it the numbers stay "12.5%".

```tsx
<CalendarReturns {...d.calendarReturns} locale="fr-FR" fundLabel="Fonds" benchmarkLabel="Indice" emptyLabel="Pas de performances par année civile communiquées." />
<ProfileChips profile={d.profile} labels={{ risk: "Risque", region: "Région" }} translate={(field, value) => (field === "riskBand" && value === "medium" ? "Moyen" : value)} />
```

## Theming

Colours come from CSS custom properties with sensible defaults. Set any of them on an ancestor (`--ff-accent`, `--ff-text`, `--ff-text-muted`, `--ff-border`, `--ff-surface`, `--ff-track`, `--ff-positive`, `--ff-negative`, `--ff-benchmark`, `--ff-font`, `--ff-c1`…`--ff-c10`, `--ff-tone-*-bg/fg`, `--ff-risk-1`…`--ff-risk-7`), or wrap a subtree:

```tsx
import { FundFactsTheme } from "@fundfactsapi/widgets";

<FundFactsTheme dark vars={{ "--ff-accent": "#7C3AED" }}>
  <FundFactsheet fund={fund} />
</FundFactsTheme>
```

Full API reference: https://fundfactsapi.com/docs · Get a free key: https://fundfactsapi.com/signup

MIT
