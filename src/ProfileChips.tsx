import { Caption, Strong, col, row } from "./primitives";
import { tokens, tones, type Tone } from "./theme";
import type { FundProfileLike } from "./types";

/** The chip captions, overridable for another language. */
export interface ProfileChipLabels {
  risk: string;
  valuation: string;
  concentration: string;
  region: string;
  sector: string;
  credit: string;
  rateSensitivity: string;
  equityShare: string;
  /** Joins the region focus and its tilt: "Global · Europe tilt". */
  tilt: string;
  noProfile: string;
  /** The footnote, given the rules version. */
  footnote: (rules: string) => string;
}

export type ProfileChipField = "riskBand" | "valuation" | "concentration" | "regionFocus" | "regionTilt" | "sectorTilt" | "creditQuality" | "rateSensitivity";

export interface ProfileChipsProps {
  /** `data.profile` — the rule-based FundFacts classification. */
  profile: FundProfileLike | null | undefined;
  /** Show the category line above the chips (default true). */
  showCategory?: boolean;
  /** Show the "derived with published rules" footnote (default false). */
  footnote?: boolean;
  /** Chip captions in another language. */
  labels?: Partial<ProfileChipLabels>;
  /** Translates a chip's value ("medium", "Global", "Information Technology") for display; the tone still follows the raw value. */
  translate?: (field: ProfileChipField, value: string) => string;
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const DEFAULT_LABELS: ProfileChipLabels = {
  risk: "Risk",
  valuation: "Valuation",
  concentration: "Concentration",
  region: "Region",
  sector: "Sector",
  credit: "Credit",
  rateSensitivity: "Rate sensitivity",
  equityShare: "Equity share",
  tilt: "tilt",
  noProfile: "No profile.",
  footnote: (rules) => `Derived from the fund's own exposures with published rules (${rules}).`,
};

/** Chips for category, risk band, concentration, region / sector tilt, valuation, credit and duration. */
export function ProfileChips({ profile, showCategory = true, footnote, labels, translate }: ProfileChipsProps) {
  const t = { ...DEFAULT_LABELS, ...labels };
  if (!profile) return <Caption>{t.noProfile}</Caption>;
  const tr = (field: ProfileChipField, value: string) => (translate ? translate(field, value) : cap(value));
  const chips: { label: string; value: string; tone: Tone }[] = [];
  if (profile.riskBand) chips.push({ label: t.risk, value: tr("riskBand", profile.riskBand), tone: profile.riskBand === "high" ? "pink" : profile.riskBand === "medium" ? "orange" : "green" });
  if (profile.valuation) chips.push({ label: t.valuation, value: tr("valuation", profile.valuation), tone: "orange" });
  if (profile.concentration) chips.push({ label: t.concentration, value: tr("concentration", profile.concentration), tone: "teal" });
  if (profile.regionFocus) {
    const focus = translate ? translate("regionFocus", profile.regionFocus) : profile.regionFocus;
    const tilt = profile.regionTilt ? (translate ? translate("regionTilt", profile.regionTilt) : profile.regionTilt) : null;
    chips.push({ label: t.region, value: tilt ? `${focus} · ${tilt} ${t.tilt}` : focus, tone: "blue" });
  }
  if (profile.sectorTilt) chips.push({ label: t.sector, value: translate ? translate("sectorTilt", profile.sectorTilt) : profile.sectorTilt, tone: "purple" });
  if (profile.creditQuality) chips.push({ label: t.credit, value: tr("creditQuality", profile.creditQuality), tone: "green" });
  if (profile.rateSensitivity) chips.push({ label: t.rateSensitivity, value: tr("rateSensitivity", profile.rateSensitivity), tone: "orange" });
  if (profile.equityShare != null) chips.push({ label: t.equityShare, value: `${Math.round(profile.equityShare)}%`, tone: "blue" });

  return (
    <div style={col(10)}>
      {showCategory ? <Strong style={{ fontSize: 15 }}>{profile.category}</Strong> : null}
      <div style={row(6, { flexWrap: "wrap" })}>
        {chips.map((c) => (
          <span key={c.label} style={{ ...row(6), padding: "4px 10px", borderRadius: 999, fontSize: 12.5, lineHeight: 1.3, background: tones[c.tone].bg, color: tones[c.tone].fg, whiteSpace: "nowrap" }}>
            <span style={{ opacity: 0.7, fontWeight: 500 }}>{c.label}</span>
            <span style={{ fontWeight: 600 }}>{c.value}</span>
          </span>
        ))}
      </div>
      {footnote && profile.rules ? <Caption style={{ color: tokens.faint }}>{t.footnote(profile.rules)}</Caption> : null}
    </div>
  );
}
