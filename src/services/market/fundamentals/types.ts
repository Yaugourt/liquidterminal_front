/**
 * Protocol fundamentals — Hyperliquid read as a business rather than a chain.
 *
 * Mirrors the backend's DefiLlama aggregate (`GET /defillama/overview/:slug`),
 * which is the same basis the market quotes when it compares Hyperliquid to
 * other venues. Our own `/market/revenue/history` breaks revenue into six
 * sources and is the more precise number, but it has no counterpart for the
 * fee/revenue split, which is what makes an income statement possible.
 */

/** Multi-period block as served by the aggregate. Nulls mean "not reported". */
export interface MoneyBlock {
  total24h: number | null;
  total7d: number | null;
  total30d: number | null;
  totalAllTime: number | null;
  change_1d: number | null;
}

/** Periods the aggregate reports on. */
export type FundamentalsPeriod = "total24h" | "total7d" | "total30d" | "totalAllTime";

export interface ProtocolFundamentals {
  slug: string;
  name: string;
  tvl: number | null;
  mcap: number | null;
  /** Notional traded. Denominator of the take rate. */
  volume: MoneyBlock | null;
  /** What users paid, before anything is redistributed. */
  fees: MoneyBlock | null;
  /** What the protocol keeps once HLP, builders and spot deployers are paid. */
  revenue: MoneyBlock | null;
}

/**
 * One period of the income statement, already reconciled.
 *
 * `costOfRevenue` is derived (fees − revenue) rather than reported: DefiLlama
 * publishes the two ends and not the middle. It is therefore an aggregate of
 * every payout — HLP, builder codes, spot deployer share — and cannot be split
 * further from this source.
 */
export interface IncomeStatement {
  period: FundamentalsPeriod;
  grossFees: number | null;
  costOfRevenue: number | null;
  protocolRevenue: number | null;
  /** Revenue ÷ fees. What the protocol keeps of every dollar paid. */
  grossMargin: number | null;
  /** Revenue spread over the days in the window. */
  revenuePerDay: number | null;
}

/**
 * No take rate here, deliberately.
 *
 * The aggregate's `volume` block reports roughly $34M a day against $1.28B of
 * perp notional on our own perp stats: it is the spot DEX line, not the venue's
 * traded notional. Dividing total revenue by it yields a rate near 1.4% where
 * the real perp taker fee is about 0.045% — a figure wrong by a factor of
 * thirty, and exactly the kind that gets quoted. It comes back the day a volume
 * series on the same basis as the revenue does.
 */

export interface UseProtocolFundamentalsResult {
  fundamentals: ProtocolFundamentals | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}
