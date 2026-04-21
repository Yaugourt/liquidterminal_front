/** LiquidTerminal `/indexer/hip4/*` — HIP-4 prediction market types. */

// ─── Data interfaces ────────────────────────────────────────────────────────

export interface Hip4MarketRow {
  outcome_id: number;
  question_id: number | null;
  coin: string;
  /** e.g. "BTC", "ETH", "crypto", "sports" */
  class: string | null;
  underlying: string | null;
  name: string | null;
  side: number | null;
  side_name: string | null;
  /** mid price 0–1 */
  mid_price: number | null;
  volume_24h: number | null;
  total_volume: number | null;
  total_trades: number | null;
  open_interest: number | null;
  is_settled: boolean;
  settled_at: string | null;
}

export interface Hip4QuestionRow {
  question_id: number;
  title: string | null;
  description: string | null;
  class: string | null;
  underlying: string | null;
  outcome_count: number | null;
  total_volume: number | null;
  created_at: string | null;
  resolved_at: string | null;
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
}

export interface Hip4FeeRow {
  date: string;
  user: string;
  coin: string;
  total_fees: number;
  fill_count: number;
}

export interface Hip4SettlementRow {
  outcome_id: number;
  coin: string | null;
  settled_px: number | null;
  settled_at: string;
  winner_side: number | null;
  tx_hash: string | null;
}

export interface Hip4OutcomeTokenRow {
  outcome_id: number;
  coin: string;
  side: number | null;
  side_name: string | null;
  description: string | null;
  underlying: string | null;
}

export interface Hip4FeeScaleRow {
  time: string;
  outcome_id: number | null;
  taker_fee_bps: number | null;
  maker_fee_bps: number | null;
  tx_hash: string | null;
}

export interface Hip4UserActionRow {
  time: string;
  user: string;
  action_type: string;
  outcome_id: number | null;
  coin: string | null;
  amount: number | null;
  tx_hash: string | null;
}

// ─── Query interfaces ────────────────────────────────────────────────────────

export interface Hip4FillsQuery {
  user?: string;
  coin?: string;
  outcome_id?: number;
  start?: string;
  end?: string;
  limit?: number;
  offset?: number;
}

export interface Hip4FeesQuery {
  user?: string;
  coin?: string;
  start?: string;
  end?: string;
  limit?: number;
  offset?: number;
}

export interface Hip4MarketsQuery {
  outcome_id?: number;
  class?: string;
  underlying?: string;
  question_id?: number;
  limit?: number;
  offset?: number;
}

export interface Hip4QuestionsQuery {
  question_id?: number;
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

export interface Hip4OutcomeTokensQuery {
  outcome_id?: number;
  coin?: string;
  limit?: number;
  offset?: number;
}

export interface Hip4FeeScalesQuery {
  start?: string;
  end?: string;
  limit?: number;
  offset?: number;
}

export interface Hip4UserActionsQuery {
  user?: string;
  action_type?: string;
  outcome_id?: number;
  start?: string;
  end?: string;
  limit?: number;
  offset?: number;
}

// ─── Hook result interfaces ──────────────────────────────────────────────────

export interface UseHip4MarketsResult {
  markets: Hip4MarketRow[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface UseHip4QuestionsResult {
  questions: Hip4QuestionRow[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface UseHip4FillsResult {
  fills: Hip4FillRow[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface UseHip4SettlementsResult {
  settlements: Hip4SettlementRow[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface UseHip4OutcomeTokensResult {
  tokens: Hip4OutcomeTokenRow[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}
