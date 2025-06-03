import { HLBridgeData, UseHLBridgeResult } from '../types';
import { fetchHLBridge } from '../api';
import { useDataFetching } from '@/hooks/useDataFetching';

export function useHLBridge(): UseHLBridgeResult {
  const {
    data: bridgeData,
    isLoading,
    error,
    refetch
  } = useDataFetching<HLBridgeData>({
    fetchFn: fetchHLBridge,
    refreshInterval: 10000, // Refresh every 10 seconds
    maxRetries: 3
  });

  return {
    bridgeData: bridgeData || null,
    isLoading,
    error,
    refetch
  };
} 