/**
 * Token icon URL helper — single source of truth for Hyperliquid's official
 * SVG CDN.
 *
 * Hyperliquid serves token icons at `https://app.hyperliquid.xyz/coins/{ID}.svg`
 * with three flavours, all observed in production:
 *  - **Perp standard**: `BTC.svg`, `ETH.svg`, `HYPE.svg`
 *  - **Spot**: `HYPE_spot.svg` (also aliased as `HYPE_USDC.svg`)
 *  - **HIP-3**: `xyz:BRENTOIL.svg` (always prefixed with `xyz:`)
 *
 * Most backend endpoints already return a fully-qualified `logo: string` field
 * on token rows — when available, prefer that. This helper is for surfaces
 * that don't have the backend logo (HIP-3 indexer rows, liquidation feed,
 * etc.) and only have a ticker / asset name.
 */

const HL_CDN_BASE = "https://app.hyperliquid.xyz/coins";

export type TokenKind = "perp" | "spot" | "hip3" | "auto";

/**
 * Build the Hyperliquid icon URL for a given asset.
 *
 * @param assetName Ticker or asset name. `xyz:BRENTOIL` is recognized as HIP-3
 *                  regardless of the `kind` arg. Plain tickers default to perp.
 * @param kind      `"auto"` (default) infers spot from `_spot` suffix and HIP-3
 *                  from `xyz:` prefix. Pass `"spot"` to force `_spot` on a bare
 *                  ticker.
 */
export function getTokenIconUrl(
  assetName: string,
  kind: TokenKind = "auto"
): string {
  const trimmed = assetName.trim();
  if (!trimmed) return "";

  // HIP-3 — always preserve the `xyz:` prefix as-is.
  if (trimmed.startsWith("xyz:")) {
    return `${HL_CDN_BASE}/${trimmed}.svg`;
  }

  // Already qualified with `_spot` or `_USDC` — pass through.
  if (/_(spot|USDC)$/i.test(trimmed)) {
    return `${HL_CDN_BASE}/${trimmed}.svg`;
  }

  if (kind === "spot") {
    return `${HL_CDN_BASE}/${trimmed}_spot.svg`;
  }
  if (kind === "hip3") {
    return `${HL_CDN_BASE}/xyz:${trimmed}.svg`;
  }

  // Default — bare ticker treated as perp.
  return `${HL_CDN_BASE}/${trimmed}.svg`;
}

/**
 * Extract the 1–2 character fallback initials to render when the icon fails
 * to load. Strips `xyz:` and `_spot`/`_USDC` suffixes to keep only the
 * meaningful ticker.
 */
export function getTokenInitials(assetName: string): string {
  const ticker = assetName
    .replace(/^xyz:/, "")
    .replace(/_(spot|USDC)$/i, "")
    .trim();
  return ticker.slice(0, 2).toUpperCase();
}
