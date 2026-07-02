export interface HypeTrade {
  coin: string;        // "@107" for HYPE
  side: "A" | "B";     // "A" for sell, "B" for buy
  px: string;          // Price as string
  sz: string;          // Size as string
  time: number;        // Timestamp
  hash: string;        // Transaction hash
  tid: number;         // Trade ID
  users: string[];     // Array of user addresses involved
}

export interface HypeTradeResponse {
  channel: string;     // "trades"
  data: HypeTrade[];
}

export interface HypePriceState {
  currentPrice: number;
  lastSide: "A" | "B" | null;
  isConnected: boolean;
  error: string | null;
}

export interface HypePriceStore extends HypePriceState {
  connect: () => void;
  disconnect: () => void;
  resetPriceAnimation: () => void;
}

export interface UseHypePriceResult {
  price: number | null;
  lastSide: "A" | "B" | null;
  isLoading: boolean;
  error: string | null;
}

// Interface pour étendre Window avec les propriétés WebSocket
export interface HypeWebSocketWindow extends Window {
  hypePriceWs?: WebSocket;
}

/** A single Assistance Fund HYPE buy (on-chain fill). */
export interface AfFill {
  time: number;
  px: number;
  sz: number;
}

/** Aggregated buyback for one UTC day. */
export interface DailyBuyback {
  /** UTC midnight of the day (ms). */
  time: number;
  hype: number;
  usd: number;
}

/** Real Assistance Fund buyback activity over a trailing window of days. */
export interface AfBuybacks {
  /** Per-day buyback series (ascending), today last and partial. */
  daily: DailyBuyback[];
  /** Most recent fills (descending) — for a live feed. */
  recent: AfFill[];
  /** Average over completed days. */
  avgDailyHype: number;
  avgDailyUsd: number;
  weeklyHype: number;
  weeklyUsd: number;
  monthlyHype: number;
  monthlyUsd: number;
  /** Completed days the average is built from. */
  windowDays: number;
  /** Realized average buy price over the window (USD / HYPE). */
  avgPrice: number;
}

export interface UseAfBuybacksResult {
  data: AfBuybacks | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}
