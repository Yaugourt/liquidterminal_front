/** LiquidTerminal `/indexer/hip3/overview` leaf payload (after backend unwrap). */
export interface Hip3Overview {
  total_dexs: number;
  total_assets: number;
  total_volume_24h: number;
  total_fees_24h: number;
  total_trades_24h: number;
  total_open_interest: number;
  active_auctions: number;
}

export interface Hip3DexRow {
  dex_id: string;
  name: string;
  deployer_address: string;
  oracle_updater: string;
  collateral_asset: string;
  fee_share_pct: number;
  is_growth_mode: boolean;
  active_since: string;
  total_staked_hype: number;
}

export interface Hip3AssetRow {
  dex_id: string;
  asset_id: number;
  ticker: string;
  symbol: string;
  max_leverage: number;
  oi_cap_usd: number;
  is_halted: boolean;
  oracle_source: string;
  update_timestamp: string;
  fee_share_pct: number;
}

export interface Hip3SnapshotRow {
  dex_id: string;
  coin: string;
  current_mark_price: number;
  current_oracle_price: number;
  current_funding_rate: number;
  open_interest: number;
  volume_24h: number;
  fees_24h: number;
  trades_24h: number;
  total_volume_cumulative: number;
  total_fees_cumulative: number;
  is_halted: boolean;
  last_update: string;
}

export interface Hip3FillRow {
  time: string;
  dex_id: string;
  coin: string;
  user: string;
  side: string;
  px: number;
  sz: number;
  notional: number;
  fee: number;
  builder_fee_usd?: number;
  is_liquidation: number;
  hash: string;
  tid?: number;
}

export interface Hip3LeaderboardRow {
  trader: string;
  total_volume: number;
  total_fees: number;
  total_trades: number;
  pnl_realized: number;
}

export interface Hip3TraderStatRow {
  dex_id: string;
  trader: string;
  coin: string;
  total_volume: number;
  total_fees: number;
  total_trades: number;
  pnl_realized: number;
  last_update: string;
}

export interface Hip3OhlcvBar {
  time: string;
  dex_id: string;
  coin: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  fees: number;
  trades: number;
}

export interface Hip3OracleBucket {
  bucket: string;
  dex_id: string;
  asset_id: number;
  mark_open: number;
  mark_high: number;
  mark_low: number;
  mark_close: number;
  oracle_open: number;
  oracle_high: number;
  oracle_low: number;
  oracle_close: number;
  max_deviation_pct: number;
  avg_funding_rate: number;
  total_oi: number;
  trade_count: number;
}

export interface Hip3AuctionRow {
  auction_id: number;
  start_time: string;
  end_time_scheduled: string;
  start_price_hype: number;
  floor_price_hype: number;
  current_gas: number;
  winner_address: string | null;
  winning_bid_hype: number | null;
  winning_ticker: string | null;
  status: string;
  tx_hash: string | null;
}

export interface Hip3AuctionHistoryRow {
  time: string;
  dex_id: string;
  coin: string;
  auction_id: string;
  start_px: number;
  end_px: number;
  cleared_px: number;
  winner: string;
  sz: number;
  status: string;
  duration_seconds: number;
}

/** User overview payload may be null for empty wallets. */
export type Hip3UserOverview = Record<string, unknown> | null;

export interface Hip3UserCoinRow {
  coin?: string;
  dex_id?: string;
  volume?: number;
  [key: string]: unknown;
}

export interface Hip3FillsQuery {
  dex_id?: string;
  coin?: string;
  user?: string;
  side?: string;
  start?: string;
  end?: string;
  min_notional?: number;
  limit?: number;
  offset?: number;
}

export interface Hip3LeaderboardQuery {
  by?: string;
  dex_id?: string;
  limit?: number;
}

export interface Hip3StatsTradersQuery {
  dex_id?: string;
  coin?: string;
  limit?: number;
  offset?: number;
}

export interface Hip3OhlcvQuery {
  coin: string;
  dex_id?: string;
  start?: string;
  end?: string;
  limit?: number;
}

export interface Hip3OracleStatsQuery {
  dex_id: string;
  asset_id?: string;
  start?: string;
  end?: string;
  limit?: number;
}

export interface Hip3UserFillsQuery {
  coin?: string;
  dex_id?: string;
  start?: string;
  end?: string;
  limit?: number;
  offset?: number;
}
