// Types pour les ordres TWAP selon la documentation Hyperliquid
export interface TwapOrderDetails {
  a: number;         // Asset (market index)
  b: boolean;        // isBuy (true = Buy, false = Sell)
  s: string;         // Size (amount as string)
  r: boolean;        // reduceOnly flag
  m: number;         // Minutes (duration)
  t: boolean;        // randomize flag
}

export interface TwapAction {
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

// TWAP enrichi avec les données de marché
export interface EnrichedTwapOrder extends TwapOrder {
  tokenSymbol: string;
  tokenPrice: number;
  totalValueUSD: number;
  progressionPercent: number;
  estimatedEndTime: number;
}

// Type pour la réponse API des ordres TWAP
export interface TwapOrdersResponse {
  success: boolean;
  data: TwapOrder[];
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
} 