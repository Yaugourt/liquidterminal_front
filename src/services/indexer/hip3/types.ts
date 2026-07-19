/** Shape of `/indexer/hip3/overview` — builder-DEX venue totals + deploy auction state. */
export interface Hip3Overview {
  total_dexs: number;
  total_assets: number;
  total_volume_24h: number;
  total_fees_24h: number;
  total_trades_24h: number;
  total_open_interest: number;
  auction_active: boolean;
  auction_price_hype: number | null;
  auction_end_at: string | null;
  next_auction_at: string | null;
}

/**
 * `/indexer/hip3/snapshots?coin=` — the only source of cumulative totals since
 * a market was listed. Everything else here duplicates Hyperliquid, which is
 * the more reliable source for live price fields.
 */
export interface Hip3Snapshot {
  dex_id: string;
  coin: string;
  current_mark_price: number;
  current_oracle_price: number;
  current_funding_rate: number;
  /** Base units, like Hyperliquid's — not USD. */
  open_interest: number;
  volume_24h: number;
  fees_24h: number;
  trades_24h: number;
  total_volume_cumulative: number;
  total_fees_cumulative: number;
  is_halted: boolean;
  last_update: string;
}

/** `/indexer/hip3/fills?coin=` — executed trades, with taker address. */
export interface Hip3Fill {
  time: string;
  dex_id: string;
  coin: string;
  user: string;
  /** `B` = buy, `A` = sell. */
  side: 'B' | 'A';
  px: number;
  sz: number;
  notional: number;
  fee: number;
  /**
   * Equal to `fee` on ~98% of rows — it is not a distinct builder cut in
   * practice. Kept for completeness; do not surface it as its own metric.
   */
  builder_fee_usd: number;
  /** Integer flag, not a boolean. */
  is_liquidation: 0 | 1;
  hash: string;
  tid: number;
}

/** `/indexer/hip3/stats/traders?coin=` — per-market trader aggregates. */
export interface Hip3CoinTrader {
  dex_id: string;
  trader: string;
  coin: string;
  total_volume: number;
  total_fees: number;
  total_trades: number;
  pnl_realized: number;
  /** Can lag by weeks on quiet markets — always surface it. */
  last_update: string;
}

export interface Hip3FillsQuery {
  coin: string;
  limit?: number;
  side?: 'B' | 'A';
  /** Server-side notional floor — the reason this beats the WS trade feed. */
  min_notional?: number;
  start?: string;
  end?: string;
}

export interface Hip3CoinTradersQuery {
  coin: string;
  limit?: number;
}
