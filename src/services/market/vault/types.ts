export interface VaultSummary {
  summary: {
    name: string;
    vaultAddress: string;
    leader: string;
    tvl: string;
    isClosed: boolean;
    relationship: {
      type: string;
      data: {
        childAddresses: string[];
      };
    };
    createTimeMillis: number;
  };
  apr: number;
}

export interface VaultsResponse {
  success: boolean;
  data: VaultSummary[];
  pagination: {
    totalTvl: number;
    total: number;
    page: number;
  };
}

export interface UseVaultsResult {
  vaults: VaultSummary[];
  totalTvl: number;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  updateParams: (params: Partial<VaultsParams>) => void;
}

export interface VaultsParams {
  page?: number;
  limit?: number;
  sortBy?: 'apr' | 'tvl';
  [key: string]: any;
} 