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