/** LiquidTerminal `/indexer/hip4/*` — HIP-4 prediction market types. */

// ─── Data interfaces ────────────────────────────────────────────────────────

interface Hip4ParsedSide {
  name: string;
}

export interface Hip4MarketEnrichedRow {
  outcome_id: number;
  question_id: number | null;
  coin: string | null;
  class: string | null;
  class_normalized: string;
  underlying: string | null;
  name: string | null;
  side: number | null;
  side_name: string | null;
  parsed_sides: Hip4ParsedSide[] | null;
  token_name: string | null;
  question_name: string | null;
  question_description: string | null;
  display_name: string;
  short_name: string;
  mid_price: number | null;
  volume_24h: number | null;
  total_volume: number | null;
  total_trades: number | null;
  open_interest: number | null;
  is_settled: boolean;
  settled_at: string | null;
  expiry: string | null;
  period: string | null;
  target_price: number | null;
}

export interface Hip4QuestionOutcome {
  outcome_id: number;
  side_name: string | null;
  display_name: string;
  mid_price: number | null;
  volume_24h: number | null;
  total_volume: number | null;
  open_interest: number | null;
  is_settled: boolean;
  settled_at: string | null;
  /**
   * Encoded, *tradeable* coin for this outcome's series (`#<10*outcome+side>`),
   * resolved against allMids during the merge. Drives the probability-history
   * chart + deep links; absent on un-merged rows.
   */
  coin?: string | null;
}

export interface Hip4QuestionWithOutcomesRow {
  question_id: number | null;
  title: string | null;
  description: string | null;
  class: string | null;
  underlying: string | null;
  outcome_count: number;
  total_volume: number;
  created_at: string | null;
  resolved_at: string | null;
  /**
   * live              — open for trading, before expiry
   * expired_unresolved — past expiry but no on-chain settlement yet
   * settled           — resolved on-chain (winner determined)
   */
  status: "live" | "expired_unresolved" | "settled";
  singleton_outcome_id: number | null;
  expiry: string | null;
  period: string | null;
  target_price: number | null;
  outcomes: Hip4QuestionOutcome[];
  /**
   * Encoded, *tradeable* side coin (`#<10*outcome+side>`) the card should link
   * to. HypeDexer keys grouped questions by raw outcome id (`#103`), which has
   * no price/fills/orderbook; the detail page needs the encoded coin (`#1030`).
   * Set by the live-market builder + the page merge. Optional: legacy callers
   * fall back to `#<outcomes[0].outcome_id>`.
   */
  primary_coin?: string | null;
}

export interface Hip4FillRow {
  time: string;
  coin: string;
  outcome_id: number | null;
  user: string;
  side: string;
  px: number;
  sz: number;
  notional: number;
  fee: number;
  hash: string;
  tid?: number;
  /** Action kind — "Buy"/"Sell" for trades, "Split Outcome"/"Merge …"/etc. for
   *  protocol operations. Non-trade dirs are excluded from trade-flow stats. */
  dir?: string;
  closedPnl?: number;
}

export interface Hip4SettlementRow {
  outcome_id: number;
  coin: string | null;
  settled_px: number | null;       // underlying asset price (e.g. 78212.4 for BTC)
  settle_fraction: number | null;  // YES fraction at settlement (0.0 = NO won, 1.0 = YES won)
  settled_at: string;
  winner_side: number | null;
  tx_hash: string | null;
  winner_name: string | null;
  question_name: string | null;
}

export interface Hip4AnalyticsBucket {
  bucket: string;
  coin?: string;
  fills: number;
  volume: number;
  buy_volume: number;
  sell_volume: number;
  fees_usdc: number;
  unique_users: number;
}

// ─── Hyperliquid outcomeMeta (canonical live-market source) ──────────────────
// HypeDexer's `/markets-enriched` + `/questions-with-outcomes` aggregation
// tables lag and currently OMIT the live markets entirely (Fed/NBA/CPI/recurring
// BTC). The canonical list of currently-registered outcomes lives in
// Hyperliquid's `outcomeMeta` info call; live prices in `allMids`. We fetch both
// directly and synthesize question/market rows so the live markets show up.

interface Hip4OutcomeMetaSide {
  name: string;
}

/** One raw outcome from POST /info { type: "outcomeMeta" }. `outcome` is the
 * RAW outcome id; each side maps to a spot coin `#<10*outcome + side>`. */
export interface Hip4OutcomeMetaEntry {
  outcome: number;
  name: string;
  description: string;
  sideSpecs: Hip4OutcomeMetaSide[];
  quoteToken?: string;
}

export interface Hip4OutcomeMetaResponse {
  outcomes: Hip4OutcomeMetaEntry[];
}

// ─── Hyperliquid market-data for live outcome coins ──────────────────────────
// `l2Book` + `candleSnapshot` (POST /info) DO return data for currently-LIVE
// outcome coins (`#1040` etc.) and `null`/`[]` for expired ones. The shared
// market WS (used by the spot/perp OrderBook + TradingView) omits `#NNN` coins,
// so these are fetched over REST instead. `px`/OHLC are 0–1 = implied prob.

export interface Hip4BookLevel {
  px: string;
  sz: string;
  /** Number of orders aggregated at this level. */
  n: number;
}

/** POST /info { type:"l2Book", coin:"#NNN" }. `levels` is `[bids, asks]`. */
export interface Hip4L2Book {
  coin: string;
  time: number;
  levels: [Hip4BookLevel[], Hip4BookLevel[]];
}

/** One OHLC bar from POST /info { type:"candleSnapshot", req:{coin,interval,…} }.
 *  o/c/h/l are the implied probability (0–1); v/n are 0 for quote-only buckets. */
export interface Hip4Candle {
  t: number;
  T: number;
  s: string;
  i: string;
  o: string;
  c: string;
  h: string;
  l: string;
  v: string;
  n: number;
}

export type Hip4CandleInterval = "15m" | "1h" | "4h" | "1d";

/** Core assembled live markets (builder output): grid-ready question rows + a
 * per-coin enriched-row map (keyed by `#<encoding>`) for the detail page and
 * fills labels, plus the raw `allMids` map so callers can price-enrich
 * HypeDexer's own questions. */
export interface Hip4LiveMarketData {
  questions: Hip4QuestionWithOutcomesRow[];
  marketsByCoin: Record<string, Hip4MarketEnrichedRow>;
  /** `#<encoding>` → mid price string (implied probability). */
  mids: Record<string, string>;
}

export interface Hip4LiveMarkets extends Hip4LiveMarketData {
  /** True when the per-outcome volume fetch failed (analytics 402), so volumes
   * fell back to 0 and any volume total is understated. */
  volumesUnavailable: boolean;
}

export interface UseHip4LiveMarketsResult {
  liveQuestions: Hip4QuestionWithOutcomesRow[];
  liveMarketsByCoin: Record<string, Hip4MarketEnrichedRow>;
  /** `#<encoding>` → mid price string, for enriching HypeDexer questions. */
  mids: Record<string, string>;
  /** Volume contribution is partial/0 because the analytics fetch failed. */
  volumesUnavailable: boolean;
  isLoading: boolean;
  error: Error | null;
  /** Epoch ms of the last successful fetch — null until first success. */
  dataUpdatedAt: number | null;
  refetch: () => void;
}

// ─── Query interfaces ────────────────────────────────────────────────────────

export interface Hip4MarketsEnrichedQuery {
  class?: string;
  underlying?: string;
  question_id?: number;
  limit?: number;
  offset?: number;
}

export interface Hip4QuestionsWithOutcomesQuery {
  question_id?: number;
  limit?: number;
  offset?: number;
}

export interface Hip4FillsQuery {
  user?: string;
  coin?: string;
  outcome_id?: number;
  start?: string;
  end?: string;
  limit?: number;
  offset?: number;
}

export interface Hip4SettlementsQuery {
  outcome_id?: number;
  start?: string;
  end?: string;
  limit?: number;
  offset?: number;
}

// ─── Hook result interfaces ──────────────────────────────────────────────────

export interface UseHip4MarketsEnrichedResult {
  markets: Hip4MarketEnrichedRow[];
  isLoading: boolean;
  error: Error | null;
  /** Epoch ms of the last successful fetch — null until first success. */
  dataUpdatedAt: number | null;
  refetch: () => void;
}

export interface UseHip4QuestionsWithOutcomesResult {
  questions: Hip4QuestionWithOutcomesRow[];
  isLoading: boolean;
  error: Error | null;
  /** Epoch ms of the last successful fetch — null until first success. */
  dataUpdatedAt: number | null;
  refetch: () => void;
}

export interface UseHip4FillsResult {
  fills: Hip4FillRow[];
  isLoading: boolean;
  error: Error | null;
  /** Epoch ms of the last successful fetch — null until first success. */
  dataUpdatedAt: number | null;
  refetch: () => void;
}

export interface UseHip4SettlementsResult {
  settlements: Hip4SettlementRow[];
  isLoading: boolean;
  error: Error | null;
  /** Epoch ms of the last successful fetch — null until first success. */
  dataUpdatedAt: number | null;
  refetch: () => void;
}

export type Hip4AnalyticsInterval = "1h" | "4h" | "1d";

export interface Hip4AnalyticsQuery {
  interval?: Hip4AnalyticsInterval;
  coin?: string;
  outcome_id?: number;
  start?: string;
  end?: string;
  limit?: number;
}

export interface UseHip4AnalyticsResult {
  buckets: Hip4AnalyticsBucket[];
  isLoading: boolean;
  error: Error | null;
  /** Epoch ms of the last successful fetch — null until first success. */
  dataUpdatedAt: number | null;
  refetch: () => void;
}
