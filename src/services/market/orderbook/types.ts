/**
 * L4 order book types — mirrors of the payloads LiquidTerminal's own `/ws`
 * emits on the `l4book` channel.
 *
 * L4 is the per-order book. Hyperliquid's public `l2Book` websocket caps at 20
 * aggregated levels per side; L4 covers the whole book, so the backend can ship
 * a 100-level ladder plus counts of the orders and the distinct makers sitting
 * on each level, and totals measured across every level that exists.
 */

/** `[price, size, orderCount, uniqueMakers]`. `size === 0` in a delta means "drop this level". */
export type L4BookLevel = [px: number, sz: number, orders: number, makers: number];

/** Aggregates over the ENTIRE book, not just the shipped ladder. */
export interface L4BookTotals {
  bidSize: number;
  askSize: number;
  bidNotional: number;
  askNotional: number;
  bidOrders: number;
  askOrders: number;
  bidLevels: number;
  askLevels: number;
  /** Distinct addresses resting at least one order anywhere in the book. */
  makers: number;
}

export interface L4BookSnapshotPayload {
  coin: string;
  time: number;
  bids: L4BookLevel[];
  asks: L4BookLevel[];
  totals: L4BookTotals;
  depth: number;
}

export interface L4BookDeltaPayload {
  coin: string;
  time: number;
  bids: L4BookLevel[];
  asks: L4BookLevel[];
  totals: L4BookTotals;
}

/** Server → client frames we care about on the `l4book` channel. */
export type L4BookMessage =
  | { type: 'connected'; data: { clientId: string } }
  | { type: 'subscribed'; data: { type: string; coin?: string } }
  | { type: 'unsubscribed'; data: { type: string } }
  | { type: 'l4book_snapshot'; data: L4BookSnapshotPayload }
  | { type: 'l4book_delta'; data: L4BookDeltaPayload }
  | { type: 'l4book_unavailable'; data: { coin: string; reason: string } }
  | { type: 'heartbeat' }
  | { type: 'error'; error: string; code?: string };

/**
 * `unavailable` is an answer, not a failure: the coin has no live book
 * (delisted HIP-3 asset, settled HIP-4 outcome). `error` means the L4 feed
 * itself is down and callers should fall back to the L2 book.
 */
export type L4BookStatus = 'idle' | 'connecting' | 'live' | 'unavailable' | 'error';

export interface L4BookState {
  coin: string | null;
  status: L4BookStatus;
  /** Best-first: bids descending, asks ascending. */
  bids: L4BookLevel[];
  asks: L4BookLevel[];
  totals: L4BookTotals | null;
  depth: number;
  lastUpdate: number | null;
  error: string | null;
}

export interface L4BookStore extends L4BookState {
  connect: (coin: string) => void;
  disconnect: () => void;
}

export interface UseL4OrderBookResult {
  bids: L4BookLevel[];
  asks: L4BookLevel[];
  totals: L4BookTotals | null;
  depth: number;
  status: L4BookStatus;
  /** True once a snapshot has landed and levels are being streamed. */
  isLive: boolean;
  /** True while the first snapshot is still in flight. */
  isLoading: boolean;
  lastUpdate: number | null;
  error: string | null;
}
