export interface FeesStats {
  dailyFees: number;
  dailySpotFees: number;
  hourlyFees: number;
  hourlySpotFees: number;
}

export interface UseFeesStatsResult {
  feesStats: FeesStats | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export interface FeesHistoryEntry {
  time: string;
  total_fees: number;
  total_spot_fees: number;
}

export interface UseFeesHistoryResult {
  feesHistory: FeesHistoryEntry[] | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// Types pour les réponses API
export interface FeesStatsResponse {
  hourlyFees?: number | string;
  dailyFees?: number | string;
  hourlySpotFees?: number | string;
  dailySpotFees?: number | string;
  data?: FeesStatsResponse;
}

export interface FeesHistoryEntryResponse {
  time: number;
  total_fees?: number | string;
  total_spot_fees?: number | string;
}

export interface FeesHistoryResponse {
  data?: FeesHistoryEntryResponse[];
} 