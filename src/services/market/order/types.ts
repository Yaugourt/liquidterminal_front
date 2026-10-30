// Types pour les ordres TWAP selon la documentation Hyperliquid
interface TwapOrderDetails {
  a: number;         // Asset (market index)
  b: boolean;        // isBuy (true = Buy, false = Sell)
  s: string;         // Size (amount as string)
  r: boolean;        // reduceOnly flag
  m: number;         // Minutes (duration)
  t: boolean;        // randomize flag
}

interface TwapAction {
  type: "twapOrder";
  twap: TwapOrderDetails;
}

export interface TwapOrder {
  time: number;
  user: string;
  action: TwapAction;
  block: number;
  hash: string;
  error: string | null;
  ended?: string | null;
}

/** Hyperliquid market family encoded in the TWAP asset index. */
export type TwapMarketType = "spot" | "perp" | "hip3";

// TWAP enrichi avec les données de marché
export interface EnrichedTwapOrder extends TwapOrder {
  tokenSymbol: string;
  tokenPrice: number;
  totalValueUSD: number;
  progressionPercent: number;
  estimatedEndTime: number;
  /** Resolved from `action.twap.a` — drives the badge in the UI. */
  marketType: TwapMarketType;
  /** Indexer source only: Hyperliquid TWAP id, raw status and executed amounts (0 while running unless a live entry knows better). */
  twapId?: number;
  status?: string;
  executedSz?: number;
  executedNtl?: number;
  /** Indexer source only: `executedSz` covers the whole TWAP (final, or tracked live since its start). */
  executedExact?: boolean;
  /** Indexer source only: last fill seen by the live feed (epoch ms); null when none. */
  lastFillAt?: number | null;
  /** Indexer source only: a live entry contributed to this order. */
  live?: boolean;
}

// Paramètres pour la récupération des ordres TWAP
export interface TwapOrderParams {
  limit?: number;
  user?: string;
  status?: "active" | "canceled" | "error" | "completed" | "all";
  sortBy?: 'time' | 'block';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  timeFrom?: number;
  timeTo?: number;
}

// Réponse avec pagination
export interface TwapOrderPaginatedResponse {
  data: EnrichedTwapOrder[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    totalVolume: number;
  };
  metadata?: {
    lastUpdate: number;
    activeOrders: number;
    canceledOrders: number;
    errorOrders: number;
  };
}

// Résultats des hooks
export interface UseTwapOrdersResult {
  orders: EnrichedTwapOrder[];
  isLoading: boolean;
  error: Error | null;
  /** The last refresh failed; `orders` are the previous load. */
  isStale?: boolean;
  /** The live feed is connected and its upstream is up (indexer source only). */
  isLive?: boolean;
  refetch: () => Promise<void>;
  total: number;
  page: number;
  totalPages: number;
  totalVolume: number;
  metadata?: {
    lastUpdate: number;
    activeOrders: number;
    canceledOrders: number;
    errorOrders: number;
  };
  updateParams: (params: Partial<TwapOrderParams>) => void;
}

export interface UseTwapOrdersOptions {
  limit?: number;
  status?: "active" | "canceled" | "error" | "completed" | "all";
  defaultParams?: Partial<TwapOrderParams>;
  initialData?: EnrichedTwapOrder[];
  /** Merge the backend's live TWAP feed over the polled list (default true). */
  live?: boolean;
}

/**
 * Live TWAP feed of the backend `/ws` (public channel "twap"). The backend
 * folds HypeDexer's status and fill sockets into one book and pushes it.
 */
export interface TwapLiveEntry {
  twapId: number;
  /** Present when the TWAP is known from the status channel; absent on progress-only patches. Raw vocabulary: 'activated', 'finished', 'terminated', 'stopped', 'waitingForTrigger'... */
  status?: string;
  /** 'BTC', 'xyz:GOLD', '@107', 'PURR/USDC', '#123'. */
  coin?: string;
  /** Lowercase address. */
  user?: string;
  /** B = buy, A = sell. */
  side?: 'A' | 'B';
  sz?: number;
  minutes?: number;
  reduceOnly?: boolean;
  randomize?: boolean;
  /** Epoch ms. */
  startTime?: number;
  /** Epoch ms of the latest status event applied. */
  statusAt?: number;
  /** Executed so far (sum of slice fills, or the final total once ended). */
  executedSz: number;
  /** USD notional executed so far. */
  executedNtl: number;
  fills: number;
  lastFillAt: number | null;
  lastPx: number | null;
  /** The executed amounts cover the whole TWAP (tracked since its start, or seeded). */
  exact: boolean;
}

/** HypeDexer socket state seen by the backend; `since` = start of the current connection. */
export interface TwapLiveUpstream {
  connected: boolean;
  since: number | null;
}

/** A delta entry: a full entry (new or status change) or only the progress fields. */
export type TwapLivePatch = Partial<TwapLiveEntry> & { twapId: number };

export type TwapLiveMessage =
  | { type: 'connected' | 'subscribed' | 'heartbeat' }
  | { type: 'twap_snapshot'; data: { entries: TwapLivePatch[]; upstream: TwapLiveUpstream; at: number } }
  | { type: 'twap_delta'; data: { entries: TwapLivePatch[]; removed: number[]; upstream: TwapLiveUpstream; at: number } }
  | { type: 'error'; code?: string; error?: string; message?: string };

export interface TwapLiveStore {
  isConnected: boolean;
  isSubscribed: boolean;
  /** Null until the first snapshot (and after a disconnect). */
  upstream: TwapLiveUpstream | null;
  /** The backend predates the channel (INVALID_SUBSCRIPTION): idle until the next reconnect. */
  unsupported: boolean;
  entries: ReadonlyMap<number, TwapLiveEntry>;
  /** Bumped by every message that changed something: dependency for memos. */
  version: number;
  /** Local time of the last snapshot or delta. */
  updatedAt: number | null;
  /** Local time the feed was last fresh (connected, subscribed, upstream up); null until the first snapshot. */
  lastFreshAt: number | null;
  connect: () => void;
  disconnect: () => void;
}

/** What the data layer reads of the feed. */
export interface TwapLiveView {
  entries: ReadonlyMap<number, TwapLiveEntry>;
  /** Store connected and upstream up: executed amounts can be trusted as fresh. */
  connected: boolean;
}
