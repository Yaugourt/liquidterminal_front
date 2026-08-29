// Backend-computed trading performance for a wallet, from the LiquidTerminal
// indexer proxy (/indexer/users/:user/*). All heavy aggregation happens
// server-side; the front only displays these validated figures.

export interface WalletPerformance {
  user: string;
  total_trades: number;
  /** Fraction 0..1. */
  win_rate: number;
  /** Average winning trade, USD. */
  avg_win: number;
  /** Average losing trade, USD. */
  avg_loss: number;
  /** Gross wins / gross losses. */
  profit_factor: number;
  /** Largest peak-to-trough equity decline, USD. */
  max_drawdown: number;
  avg_trade_size: number;
  wins: number;
  losses: number;
  /** Realized PnL, USD. */
  total_pnl: number;
  // NOTE: upstream also returns avg_holding_time_s, but it is known-inflated
  // and unreliable, so it is deliberately omitted here (never displayed).
}

export interface WalletOverview {
  user: string;
  /** Lifetime traded notional, USD. */
  total_volume: number;
  /** Lifetime fees paid, USD. */
  total_fees: number;
  fill_count: number;
  /** Distinct markets traded. */
  unique_coins: number;
  total_pnl: number;
  total_trades: number;
  total_priority_gas: number;
  /** ISO datetime of the wallet's most recent fill. */
  last_activity: string;
  win_rate: number;
}

export interface WalletFundingCoin {
  coin: string;
  /** Net funding (received − paid), USD. Negative = net cost. */
  net_usdc: number;
  paid_usdc: number;
  received_usdc: number;
  count: number;
}

/** Aggregated funding ledger for a wallet (net paid vs received), backend-computed. */
export interface WalletFundingSummary {
  user: string;
  net_usdc: number;
  paid_usdc: number;
  received_usdc: number;
  event_count: number;
  window: { start: number | null; end: number | null };
  by_coin: WalletFundingCoin[];
}

// One closed round-trip trade (entry → exit), assembled server-side from the
// wallet's fills. Realized PnL, hold duration and prices come pre-computed.
export interface WalletRoundTrip {
  /** The wallet that made the trade (present on the market-wide feed). */
  user: string;
  coin: string;
  /** "long" | "short". */
  direction: string;
  start_time: string;
  end_time: string;
  /** Hold duration in seconds. */
  duration_s: number;
  entry_price: number;
  exit_price: number;
  size_close: number;
  /** Realized PnL for the round-trip, USD. */
  pnl_realized: number;
  leverage_type: string;
  total_fees: number;
  total_volume: number;
  trade_id: number | string;
  close_hash: string;
}

export interface WalletCoinStat {
  coin: string;
  total_volume: number;
  fill_count: number;
  total_fees: number;
  avg_price: number;
  price_range: { min: number; max: number };
  /** Realized PnL on this coin, USD. */
  total_pnl: number;
}
