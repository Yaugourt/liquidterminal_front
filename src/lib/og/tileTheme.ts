/**
 * SSOT for share-tile colors.
 *
 * Tiles are rendered by Satori (`next/og`), which resolves neither CSS
 * variables nor Tailwind classes: it only understands literal values in inline
 * styles. So the one place tile hex is allowed is here, mirroring how
 * `chartTheme.ts` concentrates chart hex. Both are listed in the ESLint SSOT
 * override; anywhere else, use a token.
 *
 * `chartTheme.ts` is deliberately not imported: it pulls `lightweight-charts`,
 * a browser library, into routes that run on the server and draw no chart.
 * Values below are copied from it and from `globals.css` (V4) — keep them in
 * sync by hand, there is no build-time link.
 */

/** V4 surface and text tokens, from `globals.css`. */
export const tileColors = {
  base: "#0A0B0F",
  surface: "#0F1421",
  surface2: "#141B2A",
  borderSubtle: "#1E2535",
  textPrimary: "#EAF0F7",
  textSecondary: "#9BA7B8",
  textTertiary: "#5E6B7E",
  brand: "#83E9FF",
} as const;

/** Brand halo behind a tile headline, matching the app shell's own glow. */
export const tileHalo = "radial-gradient(900px 420px at 50% -12%, rgba(131,233,255,0.14), rgba(10,11,15,0) 70%)";

/**
 * Multi-series ramp, mirroring `chartPalette.multiSeries` plus the gold token,
 * so a tile and the card it came from colour the same source the same way.
 */
export const tileSeries = {
  cyan: "#83E9FF",
  gold: "#F9E370",
  violet: "#A78BFA",
  pink: "#F472B6",
  orange: "#FB923C",
} as const;
