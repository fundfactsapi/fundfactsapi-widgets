import type { CSSProperties, ReactNode } from "react";
import { createElement } from "react";

/**
 * Every colour the widgets use is a CSS custom property with a fallback, so
 * they render correctly with zero CSS and pick up a host design system when
 * one defines the `--ff-*` variables (or the Astryx `--color-*` tokens the
 * FundFacts site uses). Set them on any ancestor, or wrap in <FundFactsTheme>.
 */
export const tokens = {
  font: "var(--ff-font, inherit)",
  mono: "var(--ff-font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)",
  text: "var(--ff-text, var(--color-text-primary, #1C1B22))",
  muted: "var(--ff-text-muted, var(--color-text-secondary, #5B5A66))",
  faint: "var(--ff-text-faint, var(--color-text-disabled, #918F9D))",
  accent: "var(--ff-accent, var(--color-accent, #1F5EFF))",
  onAccent: "var(--ff-on-accent, #FFFFFF)",
  border: "var(--ff-border, var(--color-border, #DFE5F1))",
  borderStrong: "var(--ff-border-strong, var(--color-border-emphasized, #B9C2D3))",
  surface: "var(--ff-surface, var(--color-background-card, #FFFFFF))",
  track: "var(--ff-track, var(--color-background-muted, #EEF2FA))",
  positive: "var(--ff-positive, var(--color-data-shamrock-3, #1FA85A))",
  negative: "var(--ff-negative, var(--color-data-red-4, #D93A4B))",
  benchmark: "var(--ff-benchmark, var(--color-data-categorical-orange, #EB6E00))",
  radius: "var(--ff-radius, 10px)",
} as const;

/** Categorical series palette (donuts, stacked bars). */
export const palette = [
  "var(--ff-c1, var(--color-data-categorical-blue, #0171E3))",
  "var(--ff-c2, var(--color-data-categorical-teal, #08A3A3))",
  "var(--ff-c3, var(--color-data-categorical-purple, #6B1EFD))",
  "var(--ff-c4, var(--color-data-categorical-orange, #EB6E00))",
  "var(--ff-c5, var(--color-data-categorical-pink, #E0489F))",
  "var(--ff-c6, var(--color-data-categorical-green, #0B991F))",
  "var(--ff-c7, var(--color-data-categorical-indigo, #4F46E5))",
  "var(--ff-c8, var(--color-data-categorical-cyan, #0891B2))",
  "var(--ff-c9, var(--color-data-categorical-red, #C42B47))",
  "var(--ff-c10, var(--color-data-categorical-brown, #8B5E34))",
];
export const colorAt = (i: number) => palette[i % palette.length];
export const otherColor = "var(--ff-other, var(--color-data-gray-2, #CCD3DB))";

/** Tinted tiles / chips: background + foreground pairs. */
export const tones = {
  blue: { bg: "var(--ff-tone-blue-bg, var(--color-background-blue, #E3EEFF))", fg: "var(--ff-tone-blue-fg, var(--color-text-blue, #0B3F9F))" },
  teal: { bg: "var(--ff-tone-teal-bg, var(--color-background-teal, #D6F3EC))", fg: "var(--ff-tone-teal-fg, var(--color-text-teal, #0B5C50))" },
  purple: { bg: "var(--ff-tone-purple-bg, var(--color-background-purple, #F1E4F8))", fg: "var(--ff-tone-purple-fg, var(--color-text-purple, #5E1B78))" },
  orange: { bg: "var(--ff-tone-orange-bg, var(--color-background-orange, #FDE6D6))", fg: "var(--ff-tone-orange-fg, var(--color-text-orange, #7A3A05))" },
  green: { bg: "var(--ff-tone-green-bg, var(--color-background-green, #DFF3DC))", fg: "var(--ff-tone-green-fg, var(--color-text-green, #145B0A))" },
  pink: { bg: "var(--ff-tone-pink-bg, var(--color-background-pink, #FCE1EB))", fg: "var(--ff-tone-pink-fg, var(--color-text-pink, #87124F))" },
  neutral: { bg: "var(--ff-track, var(--color-background-muted, #EEF2FA))", fg: "var(--ff-text, var(--color-text-primary, #1C1B22))" },
} as const;
export type Tone = keyof typeof tones;

/** A ready-made dark palette; pass to <FundFactsTheme dark> or spread onto a style. */
export const darkTheme: Record<string, string> = {
  "--ff-text": "#E6E8F0",
  "--ff-text-muted": "#A6ABBB",
  "--ff-text-faint": "#6C7182",
  "--ff-accent": "#6B9BFF",
  "--ff-border": "#2A3350",
  "--ff-border-strong": "#4A5474",
  "--ff-surface": "#161B2C",
  "--ff-track": "#1F2537",
  "--ff-positive": "#3DD17A",
  "--ff-negative": "#FF7A8A",
  "--ff-other": "#3A4256",
  "--ff-tone-blue-bg": "#1B2A4D",
  "--ff-tone-blue-fg": "#C7D3FF",
  "--ff-tone-teal-bg": "#123833",
  "--ff-tone-teal-fg": "#99E2D3",
  "--ff-tone-purple-bg": "#33204A",
  "--ff-tone-purple-fg": "#FAC1FF",
  "--ff-tone-orange-bg": "#40281A",
  "--ff-tone-orange-fg": "#FFC9A2",
  "--ff-tone-green-bg": "#173A1C",
  "--ff-tone-green-fg": "#9FE59B",
  "--ff-tone-pink-bg": "#40203A",
  "--ff-tone-pink-fg": "#FFC3DA",
};

export interface FundFactsThemeProps {
  /** CSS custom properties to set, e.g. { "--ff-accent": "#0A7" }. */
  vars?: Record<string, string>;
  /** Apply the built-in dark palette. */
  dark?: boolean;
  style?: CSSProperties;
  className?: string;
  children?: ReactNode;
}

/** Scopes theme variables to a subtree. Optional: the widgets work without it. */
export function FundFactsTheme({ vars, dark, style, className, children }: FundFactsThemeProps) {
  const cssVars = { ...(dark ? darkTheme : {}), ...(vars ?? {}) } as CSSProperties;
  return createElement("div", { className, style: { color: tokens.text, fontFamily: tokens.font, ...cssVars, ...style } }, children);
}
