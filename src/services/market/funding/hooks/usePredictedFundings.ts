import { getPredictedFundings } from '../api';
import { FundingCarryRow } from '../types';
import { useDataFetching } from '../../../../hooks/useDataFetching';

interface UsePredictedFundingsResult {
  rows: FundingCarryRow[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  dataUpdatedAt: number | null;
}

interface UsePredictedFundingsOptions {
  /** Poll period in ms; defaults to the 30s market tier. */
  refreshInterval?: number;
}

/**
 * Cross-venue predicted funding rates (HL vs Binance vs Bybit), annualized and
 * carry-ranked. Keyless HL source, 30s-refreshed like the other market hooks
 * unless the caller needs it less often.
 */
export const usePredictedFundings = (options: UsePredictedFundingsOptions = {}): UsePredictedFundingsResult => {
  const { data, isLoading, isRefreshing, error, refetch, dataUpdatedAt } = useDataFetching<FundingCarryRow[]>({
    fetchFn: getPredictedFundings,
    refreshInterval: options.refreshInterval,
  });

  return {
    rows: data ?? [],
    isLoading,
    isRefreshing,
    error,
    refetch,
    dataUpdatedAt,
  };
};
