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
