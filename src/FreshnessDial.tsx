import { Label, col, row } from "./primitives";
import { tokens } from "./theme";

export interface FreshnessDialProps {
  /** Envelope `generatedAt` (ISO). */
  generatedAt: string | null | undefined;
  /** Envelope `expiresAt` (ISO); defaults to generatedAt + 24 h. */
  expiresAt?: string | null;
  /** `data.dataAsOf` — the as-of date of the underlying figures. */
  dataAsOf?: string | null;
  /** Clock override (tests, static rendering). */
  now?: Date | string | number;
}

const fmt = (iso: string) => iso.slice(0, 16).replace("T", " ") + "Z";

/** How far through its 24-hour life the payload is, plus the as-of date of the figures. */
export function FreshnessDial({ generatedAt, expiresAt, dataAsOf, now }: FreshnessDialProps) {
  if (!generatedAt) return <Label>No timestamp.</Label>;
  const gen = new Date(generatedAt).getTime();
  const exp = expiresAt ? new Date(expiresAt).getTime() : gen + 24 * 3600 * 1000;
  // Reading the clock during render is deliberate: the dial must work in server
  // components (no hooks) and pass `now` for deterministic output (tests, static pages).
  // eslint-disable-next-line react-hooks/purity
  const t = now != null ? new Date(now).getTime() : Date.now();
  const total = Math.max(1, exp - gen);
  const elapsedH = Math.max(0, Math.min(24, (t - gen) / 3_600_000));
  const frac = Math.min(1, Math.max(0, (t - gen) / total));
  const r = 30;
  const c = 2 * Math.PI * r;
  const stale = t > exp;
  return (
    <div style={row(16, { flexWrap: "wrap" })}>
      <svg width="84" height="84" viewBox="0 0 80 80" role="img" aria-label={stale ? "Payload due for refresh" : `${Math.round(elapsedH)} of 24 cache hours elapsed`} style={{ flexShrink: 0, fontFamily: tokens.font }}>
        <circle cx="40" cy="40" r={r} fill="none" stroke={tokens.track} strokeWidth="8" />
        <circle cx="40" cy="40" r={r} fill="none" stroke={stale ? tokens.benchmark : tokens.accent} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${c * frac} ${c}`} transform="rotate(-90 40 40)" />
        <text x="40" y="38" textAnchor="middle" fontSize="15" fontWeight="700" fill={tokens.text} style={{ fontVariantNumeric: "tabular-nums" }}>
          {stale ? "24h+" : `${Math.round(elapsedH)}h`}
        </text>
        <text x="40" y="51" textAnchor="middle" fontSize="8" fill={tokens.muted}>
          of 24h
        </text>
      </svg>
      <div style={col(4)}>
        <span style={row(8)}>
          <span style={{ width: 8, height: 8, borderRadius: 99, background: stale ? tokens.benchmark : tokens.positive }} />
          <Label style={{ color: tokens.text, fontWeight: 500 }}>{stale ? "Refreshes on the next request" : "Fresh · served from the 24-hour store"}</Label>
        </span>
        {dataAsOf ? <Label style={{ fontVariantNumeric: "tabular-nums" }}>figures as of {dataAsOf}</Label> : null}
        <Label style={{ fontVariantNumeric: "tabular-nums" }}>generated {fmt(generatedAt)}</Label>
        <Label style={{ fontVariantNumeric: "tabular-nums" }}>expires {fmt(new Date(exp).toISOString())}</Label>
      </div>
    </div>
  );
}
