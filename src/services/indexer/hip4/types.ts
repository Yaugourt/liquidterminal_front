/** LiquidTerminal `/indexer/hip4/*` — HIP-4 prediction market types. */

// ─── Data interfaces ────────────────────────────────────────────────────────

export interface Hip4ParsedSide {
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
  status: "live" | "settled";
  singleton_outcome_id: number | null;
  outcomes: Hip4QuestionOutcome[];
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

export interface Hip4SettlementRow {
  outcome_id: number;
  coin: string | null;
  settled_px: number | null;
  settled_at: string;
  winner_side: number | null;
  tx_hash: string | null;
  winner_name: string | null;
  question_name: string | null;
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
  refetch: () => void;
}

export interface UseHip4QuestionsWithOutcomesResult {
  questions: Hip4QuestionWithOutcomesRow[];
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
