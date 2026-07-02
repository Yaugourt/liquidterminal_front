import { useMemo } from 'react';
import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchAssistanceFundData } from '../api';
import { UseAssistanceFundResult, AssistanceFundData, AssistanceFundRaw } from '../types';
import { useHypePrice } from '../../hype/hooks/useHypePrice';

/**
 * Hook to fetch assistance fund data.
 *
 * On-chain facts (HYPE balance, cost basis) are fetched once and refreshed
 * every 30s; the live mark value and unrealized PnL are recomputed whenever
 * the HYPE price ticks.
 */
export const useAssistanceFund = (): UseAssistanceFundResult => {
  // Get real-time HYPE price
  const { price: hypePrice, isLoading: hypePriceLoading } = useHypePrice();

  // On-chain balance + cost basis (price-independent)
  const {
    data: raw,
    isLoading: balanceLoading,
    error,
    refetch,
  } = useDataFetching<AssistanceFundRaw>({
    fetchFn: fetchAssistanceFundData,
    refreshInterval: 30000, // 30 seconds
    dependencies: [],
    maxRetries: 3
  });

  // Final data valued at the live HYPE price
  const data: AssistanceFundData | null = useMemo(() => {
    if (raw && hypePrice) {
      const hypeValueUsd = raw.hypeBalance * hypePrice;
      const unrealizedPnlUsd = hypeValueUsd - raw.costBasisUsd;
      const unrealizedPnlPct =
        raw.costBasisUsd > 0 ? (unrealizedPnlUsd / raw.costBasisUsd) * 100 : 0;
      return {
        ...raw,
        hypeValueUsd,
        unrealizedPnlUsd,
        unrealizedPnlPct,
      };
    }
    return null;
  }, [raw, hypePrice]);

  return {
    data,
    isLoading: balanceLoading || hypePriceLoading,
    error,
    refetch,
  };
};
