import type { Hip3CoinTrader } from "@/services/indexer/hip3";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

/**
 * Drop rows that would misrepresent the market.
 *
 * The zero address is returned as a genuine trader by the upstream aggregate —
 * on some markets it ranks first with millions in volume. Leaving it in would
 * overstate concentration by tens of percent and link to a meaningless address.
 */
export function sanitizeHip3Traders(rows: Hip3CoinTrader[]): Hip3CoinTrader[] {
  return rows.filter((row) => {
    const trader = row.trader?.toLowerCase();
    return Boolean(trader) && trader !== ZERO_ADDRESS;
  });
}

/**
 * Whether a realised-PnL figure is worth showing.
 *
 * On thin markets the aggregate degenerates — a trader with a single fill can
 * report a PnL equal to their entire notional, which is impossible. Rather than
 * print a number we know is wrong, the cell renders as "—".
 */
export function isPnlPlausible(row: Hip3CoinTrader): boolean {
  if (row.total_trades < 5) return false;
  if (!Number.isFinite(row.pnl_realized) || !Number.isFinite(row.total_volume)) return false;
  if (row.total_volume <= 0) return false;
  return Math.abs(row.pnl_realized) <= row.total_volume * 0.5;
}

export interface Hip3Concentration {
  /** Volume held by the top N, as a share of `reference`. */
  share: number | null;
  topVolume: number;
  /** Denominator used — cumulative market volume when available. */
  reference: number | null;
  segments: Array<{ value: number; trader: string }>;
}

/**
 * Share of the market held by its biggest traders.
 *
 * Measured against cumulative market volume, because the trader aggregate is
 * itself cumulative — comparing it to a 24h figure would produce shares well
 * over 100%.
 */
export function buildHip3Concentration(
  rows: Hip3CoinTrader[],
  cumulativeVolume: number | null,
  topN = 5
): Hip3Concentration {
  const top = rows.slice(0, topN);
  const topVolume = top.reduce((sum, row) => sum + (row.total_volume || 0), 0);
  const reference = cumulativeVolume && cumulativeVolume > 0 ? cumulativeVolume : null;
  return {
    share: reference ? topVolume / reference : null,
    topVolume,
    reference,
    segments: top.map((row) => ({ value: row.total_volume || 0, trader: row.trader })),
  };
}
