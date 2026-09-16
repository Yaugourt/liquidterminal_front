// ==================== RAW UPSTREAM (Hyperfolio /yield via LT backend) ====================

export type YieldCategory = 'lending' | 'amm' | 'yield' | 'staking' | 'derivatives';
export type YieldType = 'supply' | 'borrow' | 'lp' | 'stake' | 'pt' | 'yt' | 'vault';
export type YieldRiskLevel = 'low' | 'medium' | 'high';
export type YieldSortField = 'apy' | 'tvl' | 'name';
export type SortOrder = 'asc' | 'desc';

interface RawYieldToken {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
}

export interface RawYieldOpportunity {
  id: string;
  protocol: { id: string; name: string; category: string; website?: string; chainId?: number };
  category: YieldCategory;
  type: YieldType;
  pool: {
    address: string;
    name: string;
    symbol?: string;
    tvlUsd?: number;
    token0?: RawYieldToken;
    token1?: RawYieldToken;
    underlyingToken?: RawYieldToken;
  };
  apy: {
    baseApy: number;
    totalApy: number;
    rewardApy?: number;
    available?: boolean;
    historical?: { apy1d?: number; apy7d?: number; apy30d?: number };
  };
  risk: { riskLevel: YieldRiskLevel; impermanentLossRisk?: boolean; liquidationRisk?: boolean };
  metadata: { underlyingToken?: string; underlyingSymbol?: string };
  lastUpdated: string;
  dataSource: string;
}

export interface RawYieldFilterOption {
  value: string;
  count: number;
  label: string;
}

export interface RawYieldResponse {
  data: RawYieldOpportunity[];
  pagination: { total: number; page: number; page_size: number; total_pages: number };
  metadata: {
    filters: { categories: RawYieldFilterOption[]; protocols: RawYieldFilterOption[] };
    totals: { total_value_usd: number; total_apy: number; opportunity_count: number };
  };
}

// ==================== NORMALIZED ====================

export interface YieldOpportunity {
  id: string;
  protocol: { id: string; name: string; website: string | null };
  category: YieldCategory;
  type: YieldType;
  poolName: string;
  poolAddress: string;
  /** Token symbols involved (pair for LPs, underlying for vaults/markets). */
  tokens: string[];
  apy: {
    total: number;
    base: number;
    reward: number;
    apy7d: number | null;
    apy30d: number | null;
  };
  /** Missing on lending markets — never fake it. */
  tvl: number | null;
  risk: { level: YieldRiskLevel; impermanentLoss: boolean; liquidation: boolean };
  lastUpdated: number;
}

export interface YieldFacet {
  value: string;
  label: string;
  count: number;
}

export interface YieldsPage {
  items: YieldOpportunity[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  facets: { categories: YieldFacet[]; protocols: YieldFacet[] };
  totals: { tvl: number; weightedApy: number; count: number };
}

// ==================== PARAMS ====================

export interface YieldsQuery {
  page: number;
  pageSize: number;
  search?: string;
  category?: YieldCategory | 'all';
  protocol?: string | 'all';
  tokenSymbol?: string;
  minApy?: number;
  maxApy?: number;
  minTvl?: number;
  sortBy: YieldSortField;
  sortOrder: SortOrder;
}
