import { useMemo } from 'react';
import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchAssistanceFundData } from '../api';
import { UseAssistanceFundResult, AssistanceFundData } from '../types';
import { useHypePrice } from '../../hype/hooks/useHypePrice';

/**
 * Hook to fetch assistance fund data
 * Updates every 30 seconds and when HYPE price changes
 */
export const useAssistanceFund = (): UseAssistanceFundResult => {
  // Get real-time HYPE price
  const { price: hypePrice, isLoading: hypePriceLoading } = useHypePrice();

  // Use useDataFetching for data management
  const { 
    data: balanceData, 
    isLoading: balanceLoading, 
    error 
  } = useDataFetching<number>({
    fetchFn: async () => {
      // Fetch only HYPE balance (without price dependency)
      const assistanceFundData = await fetchAssistanceFundData(1); // Temporary price
      return assistanceFundData.hypeBalance;
    },
    refreshInterval: 30000, // 30 seconds
    dependencies: [], // No dependencies to avoid unnecessary re-fetches
    maxRetries: 3
  });

  // Calculate final data with real-time HYPE price
  const data: AssistanceFundData | null = useMemo(() => {
    if (balanceData !== null && hypePrice) {
      return {
        hypeBalance: balanceData,
        hypeValueUsd: balanceData * hypePrice
      };
    }
    return null;
  }, [balanceData, hypePrice]);

  return {
    data,
    isLoading: balanceLoading || hypePriceLoading,
    error
  };
};
