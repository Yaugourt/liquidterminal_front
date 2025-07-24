import { BridgeData, UseHLBridgeResult, fetchHLBridge } from '../index';
import { useDataFetching } from '@/hooks/useDataFetching';

export function useHLBridge(): UseHLBridgeResult {
  const {
    data: bridgeData,
    isLoading,
    error,
    refetch
  } = useDataFetching<BridgeData>({
    fetchFn: fetchHLBridge,
    refreshInterval: 60000, 
    maxRetries: 3
  });

  return {
    bridgeData: bridgeData || null,
    isLoading,
    error,
    refetch
  };
} 