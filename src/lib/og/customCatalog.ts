/**
 * Catalog of metrics a visitor can drop onto a custom share-tile.
 *
 * Shared between the picker UI (labels) and the `/api/tile/custom` route
 * (allowlist + value resolution). Client-safe: no fetching here, only the
 * key/label list; the route owns the server-side value lookup.
 */
export interface CustomMetric {
  key: string;
  label: string;
  /** Grouping for the picker. */
  group: string;
}

export const CUSTOM_METRICS: CustomMetric[] = [
  { key: "volume_24h", label: "24h volume", group: "Activity" },
  { key: "trades_24h", label: "Trades (24h)", group: "Activity" },
  { key: "active_users", label: "Active traders (24h)", group: "Activity" },
  { key: "markets_24h", label: "Markets traded (24h)", group: "Activity" },
  { key: "open_interest", label: "Open interest", group: "Markets" },
  { key: "fees_24h", label: "Fees (24h)", group: "Markets" },
  { key: "liquidations_24h", label: "Liquidations (24h)", group: "Markets" },
  { key: "hip3_volume", label: "HIP-3 24h volume", group: "HIP-3" },
  { key: "hip3_oi", label: "HIP-3 open interest", group: "HIP-3" },
  { key: "hype_price", label: "HYPE price", group: "HYPE & capital" },
  { key: "hype_mcap", label: "HYPE market cap", group: "HYPE & capital" },
  { key: "hlp_tvl", label: "HLP TVL", group: "HYPE & capital" },
  { key: "stablecoins", label: "Stablecoin supply", group: "HYPE & capital" },
];

export const CUSTOM_METRIC_KEYS = CUSTOM_METRICS.map((m) => m.key);

/** Max metrics on one tile (one hero + up to five supporting cells). */
export const CUSTOM_MAX = 6;
