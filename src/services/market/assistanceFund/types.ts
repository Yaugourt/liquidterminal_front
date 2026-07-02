// Types pour l'API spotClearinghouseState de Hyperliquid

export interface SpotBalance {
  coin: string;
  hold: string;
  total: string;
  /** Cumulative USD notional spent acquiring the balance (cost basis). */
  entryNtl?: string;
}

export interface SpotClearinghouseStateResponse {
  balances: SpotBalance[];
}

export interface SpotClearinghouseStateRequest {
  type: "spotClearinghouseState";
  user: string;
}

/** Price-independent on-chain facts about the Assistance Fund HYPE position. */
export interface AssistanceFundRaw {
  /** HYPE held by the AF address. */
  hypeBalance: number;
  /** Cumulative USD spent buying that HYPE (on-chain `entryNtl`). */
  costBasisUsd: number;
  /** Average acquisition price = costBasisUsd / hypeBalance. */
  avgEntryPrice: number;
}

export interface AssistanceFundData extends AssistanceFundRaw {
  /** Live mark value of the AF holdings. */
  hypeValueUsd: number;
  /** hypeValueUsd − costBasisUsd. */
  unrealizedPnlUsd: number;
  /** Unrealized PnL as a percentage of cost basis. */
  unrealizedPnlPct: number;
}

export interface UseAssistanceFundResult {
  data: AssistanceFundData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}
