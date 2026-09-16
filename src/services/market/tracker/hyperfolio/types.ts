// ==================== ENVELOPE ====================

/** LiquidTerminal backend envelope for `/hyperfolio/*` routes. */
export interface HyperfolioEnvelope<T> {
  success: boolean;
  data: T;
}

/** Upstream cache envelope forwarded by the backend on wallet endpoints. */
export interface HyperfolioCacheInfo {
  lastUpdate: string;
  cacheAge: string;
  cacheAgeSeconds: number;
  source: 'cache' | 'api';
  isStale: boolean;
}

// ==================== RAW UPSTREAM SHAPES ====================
// Mirrors LiquidTerminal_Back `types/hyperfolio.types.ts`. Numbers arrive as
// strings on wallet endpoints; the normalizers in `api.ts` convert them once.

export interface RawEvmToken {
  address: string;
  balance: string;
  symbol: string;
  name: string;
  decimals: string;
  usdPrice: string;
  usdValue: string;
  image_url: string | null;
  type: string;
}

export interface RawCompositionResponse {
  data: { tokens: RawEvmToken[]; totalWalletValue: string; hypePrice: string };
  cache: HyperfolioCacheInfo;
}

export interface RawPositionToken {
  address: string;
  symbol: string;
  name: string;
  image_url: string | null;
  decimals: number | string;
  balance: string;
  formattedBalance: string;
  usdValue: string;
}

export interface RawPositionReward {
  assetAddress: string;
  symbol: string;
  claimable: string;
  claimableUsd: string;
  paidToDate: string;
  paidToDateUsd: string;
}

export interface RawEstimatedYield {
  daily: string;
  weekly: string;
  monthly: string;
}

export interface RawPosition {
  id: string;
  protocolId: string;
  protocolName: string;
  type: string;
  positionType: string;
  totalValueUSD: string;
  healthRatio?: number | null;
  isIsolated?: boolean;
  version?: string;
  details: {
    token?: RawPositionToken;
    tokens?: RawPositionToken[];
    apy?: string;
    estimatedYield?: RawEstimatedYield;
    reward?: RawPositionReward;
    tokenId?: string;
    positionType?: string;
  };
}

export interface RawProtocolStats {
  weightedApyPercent: number | null;
  positionsWithApy: number;
  totalPositions: number;
  estimatedYield: RawEstimatedYield;
}

export interface RawProtocol {
  id: string;
  name: string;
  logo: string;
  url: string;
  totalValueUSD: string;
  positions: RawPosition[];
  warning?: string;
  metadata?: { partialData?: boolean; fetchDuration?: number };
  protocolStats: RawProtocolStats;
}

export interface RawPortfolioStats {
  totalValueUSD: string;
  weightedApyPercent: number | null;
  positionsWithApy: number;
  totalPositions: number;
  estimatedYield: RawEstimatedYield;
}

export interface RawPositionsResponse {
  data: { protocols: RawProtocol[]; portfolioStats: RawPortfolioStats };
  cache: HyperfolioCacheInfo;
}

export interface StreamProgress {
  completed: number;
  total: number;
}

export type RawStreamEvent =
  | { type: 'protocol'; data: RawProtocol; progress: StreamProgress }
  | { type: 'error'; error: string; progress?: StreamProgress; fatal?: boolean }
  | { type: 'complete'; progress: StreamProgress; portfolioStats?: RawPortfolioStats };

export interface RawPortfolioSnapshot {
  total_value_usd: number;
  total_positions: number;
  active_protocols: number;
  token_value_usd?: number;
  defi_value_usd?: number;
  hypercore_value_usd?: number;
  nft_value_usd?: number;
  protocols_breakdown?: Record<string, number>;
  snapshot_date: string;
  snapshot_timestamp: number;
}

export interface RawPortfolioHistoryResponse {
  snapshots: RawPortfolioSnapshot[];
  summary: {
    current_value: number;
    change_24h: number | null;
    change_7d: number | null;
    change_30d: number | null;
    percent_change_24h: number | null;
    percent_change_7d: number | null;
    percent_change_30d: number | null;
    first_snapshot: string | null;
    last_snapshot: string | null;
    total_snapshots: number;
  };
}

export interface RawDecodedToken {
  address: string;
  symbol: string;
  amount: string;
  amountRaw: string;
  decimals: number;
  priceUSD: number | null;
  valueUSD: number | null;
}

export interface RawTransaction {
  hash: string;
  blockNumber: string;
  timeStamp: string;
  from: string;
  to: string;
  value: string;
  contractAddress?: string;
  tokenSymbol?: string;
  tokenName?: string;
  tokenDecimal?: string;
  gasUsed?: string;
  gasPrice?: string;
  isError?: string;
  txreceipt_status?: string;
  functionName?: string;
  type: 'normal' | 'token' | 'internal';
  decoded?: {
    method: string;
    action: string;
    protocol: { id: string; name: string; logo: string };
    direction: string;
    tokens?: RawDecodedToken[];
  };
}

export interface RawTransactionsResponse {
  transactions: RawTransaction[];
  page: number;
  offset: number;
  total: number;
  hasMore: boolean;
}

export interface RawNft {
  address: string;
  name: string;
  symbol: string;
  collection_name: string;
  tokenId?: string;
  image?: string | null;
  image_url?: string | null;
  price?: number | string | null;
  floorPrice?: number | string | null;
  floor_price?: number | string | null;
}

export interface RawNftsResponse {
  data: {
    nfts: RawNft[];
    pagination: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
    totalNftValue: number;
    whypeUsdPrice: number;
  };
  cache: HyperfolioCacheInfo;
}

export interface RawPointsResponse {
  data: { protocolName: string; points: number }[];
  cache: HyperfolioCacheInfo;
}

// ==================== NORMALIZED (UI) SHAPES ====================

export interface EvmToken {
  address: string;
  symbol: string;
  name: string;
  balance: number;
  price: number;
  value: number;
  logo: string | null;
}

export interface EvmComposition {
  tokens: EvmToken[];
  totalValue: number;
  hypePrice: number;
  updatedAt: string;
}

export interface DefiPositionToken {
  address: string;
  symbol: string;
  name: string;
  logo: string | null;
  amount: number;
  value: number;
}

export interface DefiPosition {
  id: string;
  /** Upstream category: lending, vault, staking, liquidity… */
  type: string;
  /** Upstream side: supplied, borrowed, vault, reward-bearing-token… */
  positionType: string;
  value: number;
  healthRatio: number | null;
  apy: number | null;
  tokens: DefiPositionToken[];
  reward: { symbol: string; claimable: number; claimableUsd: number } | null;
}

export interface DefiProtocol {
  id: string;
  name: string;
  logo: string | null;
  url: string;
  totalValue: number;
  weightedApy: number | null;
  positions: DefiPosition[];
  warning: string | null;
  partial: boolean;
}

export interface DefiPortfolioStats {
  totalValue: number;
  weightedApy: number | null;
  positionsWithApy: number;
  totalPositions: number;
  estimatedYieldDaily: number;
  estimatedYieldMonthly: number;
}

export type DefiPositionsStatus = 'idle' | 'streaming' | 'complete' | 'error' | 'rate-limited';

export interface DefiPositionsState {
  status: DefiPositionsStatus;
  protocols: DefiProtocol[];
  progress: StreamProgress | null;
  stats: DefiPortfolioStats | null;
  error: string | null;
  updatedAt: number | null;
  /** `stream` while the SSE feed is used, `json` after a fallback to /positions. */
  source: 'stream' | 'json' | null;
}

export interface PortfolioSnapshot {
  time: number;
  total: number;
  tokens: number;
  defi: number;
  hypercore: number;
  nft: number;
  protocols: Record<string, number>;
}

export interface PortfolioHistory {
  snapshots: PortfolioSnapshot[];
  currentValue: number;
  change24h: number | null;
  change7d: number | null;
  change30d: number | null;
  percent24h: number | null;
  percent7d: number | null;
  percent30d: number | null;
  totalSnapshots: number;
}

export interface EvmTransactionToken {
  symbol: string;
  amount: number;
  valueUsd: number | null;
}

export interface EvmTransaction {
  hash: string;
  timestamp: number;
  blockNumber: number;
  from: string;
  to: string;
  type: 'normal' | 'token' | 'internal';
  action: string;
  protocol: { id: string; name: string; logo: string | null };
  direction: 'in' | 'out' | 'neutral';
  tokens: EvmTransactionToken[];
  failed: boolean;
}

export type EvmTransactionType = 'all' | 'normal' | 'token' | 'internal';

export interface EvmTransactionsParams {
  page: number;
  offset: number;
  search?: string;
  type?: EvmTransactionType;
  startDate?: string;
  endDate?: string;
}

export interface EvmTransactionsPage {
  transactions: EvmTransaction[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

export interface WalletNft {
  id: string;
  collectionAddress: string;
  collectionName: string;
  name: string;
  tokenId: string | null;
  image: string | null;
  price: number | null;
  floorPrice: number | null;
}

export interface WalletNftsPage {
  nfts: WalletNft[];
  page: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  totalValue: number;
}

export interface ProtocolPoints {
  protocol: string;
  points: number;
}

// ==================== HOOK RESULTS ====================

export interface UseEvmCompositionResult {
  composition: EvmComposition | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: Error | null;
  dataUpdatedAt: number | null;
  refetch: () => void;
}

export interface UseDefiPositionsResult extends DefiPositionsState {
  isLoading: boolean;
  refresh: () => void;
}
