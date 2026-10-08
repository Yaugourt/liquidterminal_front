interface HypeTrade {
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

/** `activeAssetCtx` frame of a spot coin (~1/s); values are decimal strings. */
export interface HypeSpotCtxResponse {
  channel: string;     // "activeSpotAssetCtx"
  data: {
    coin: string;
    ctx: { markPx?: string; prevDayPx?: string; dayNtlVlm?: string };
  };
}

interface HypePriceState {
  currentPrice: number;
  /** Mark price from the spot asset context (0 until its first frame). */
  markPx: number;
  /** Price 24h ago from the spot asset context (0 until its first frame). */
  prevDayPx: number;
  /** 24h notional volume (USD) from the spot asset context (0 until its first frame). */
  dayNtlVlm: number;
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

/** Backend `/market/revenue/af-buybacks`. */
export interface AfBuybacksPayload {
  /** Completed UTC days read whole, oldest first (a day Hyperliquid no longer holds whole is left out). */
  days: DailyBuyback[];
  /** The running UTC day so far. */
  today: DailyBuyback;
  /** The running day's latest buys, newest first. */
  recent: AfFill[];
  /** Completed days the window spans. */
  windowDays: number;
  /** Epoch ms of the backend's last read of the running day. */
  lastUpdate: number;
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
  /** True during a background/manual refresh (drives the freshness cue spinner). */
  isRefreshing: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  /** Epoch ms of the last successful fetch, or null before the first. */
  dataUpdatedAt: number | null;
}
