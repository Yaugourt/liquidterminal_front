import { BridgeData, UseHLBridgeResult } from '../types';
import { fetchHLBridge } from '../api';
import { useDataFetching } from '@/hooks/useDataFetching';

export function useHLBridge(): UseHLBridgeResult {
  const {
    data: bridgeData,
    isLoading,
    error,
    refetch
  } = useDataFetching<BridgeData>({
    fetchFn: fetchHLBridge,
    refreshInterval: 60000, // Refresh every 10 seconds
    maxRetries: 3
  });

  return {
    bridgeData: bridgeData || null,
    isLoading,
    error,
    refetch
  };
} 