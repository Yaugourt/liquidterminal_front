// Type pour les statistiques globales du marché spot
export interface SpotGlobalStats {
  totalVolume24h: number;
  totalPairs: number;
  totalMarketCap: number;
  totalSpotUSDC: number;
  totalHIP2: number;
}

export interface SpotToken {
  name: string;
  logo: string | null;
  price: number;
  marketCap: number;
  volume: number;
  change24h: number;
  liquidity: number;
  supply: number;
  marketIndex: number;
  tokenId: string;
}

export interface SpotMarketResponse {
  data: SpotToken[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  totalVolume: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/** Per-market metadata derived from HL `spotMetaAndAssetCtxs`. */
export interface SpotPairMeta {
  /** Actual quote asset of the pair (USDC, USDT0, USDH, ...). */
  quote: string;
  /** On-HL circulating supply of the base token (null when unavailable). */
  circulatingSupply: number | null;
}

export interface TokenHolderRow {
  address: string;
  /** Spot balance plus staked balance. */
  amount: number;
  /** Staked part of `amount` (0 when the address stakes nothing). */
  staked: number;
}

/** A balance tier, largest first. Every holder is counted, not just a page. */
export interface TokenHolderCohort {
  label: string;
  /** Smallest balance in the tier. */
  min: number;
  count: number;
  balance: number;
}

/** One page of `/market/holders/:token` (backend-aggregated Hypurrscan lists). */
export interface TokenHoldersPage {
  token: string;
  /** Hypurrscan regeneration time, in seconds. */
  lastUpdate: number;
  /** Distinct addresses with a positive balance (spot + staked). */
  holdersCount: number;
  /** Summed balance of every holder. */
  totalBalance: number;
  holders: TokenHolderRow[];
  pagination: {
    page: number;
    limit: number;
    /** Rows that can be paged through (the largest 10,000 holders). */
    total: number;
    totalPages: number;
  };
  cohorts: TokenHolderCohort[];
} 