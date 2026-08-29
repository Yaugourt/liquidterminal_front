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

/**
 * Cross-venue predicted funding rates (HL vs Binance vs Bybit), annualized and
 * carry-ranked. Keyless HL source, 30s-refreshed like the other market hooks.
 */
export const usePredictedFundings = (): UsePredictedFundingsResult => {
  const { data, isLoading, isRefreshing, error, refetch, dataUpdatedAt } = useDataFetching<FundingCarryRow[]>({
    fetchFn: getPredictedFundings,
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
