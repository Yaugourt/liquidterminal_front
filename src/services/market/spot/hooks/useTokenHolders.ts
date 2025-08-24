import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchTokenHolders, fetchStakedHolders } from '../api';
import { TokenHoldersResponse } from '../types';

export function useTokenHolders(tokenName: string) {
  const { 
    data: normalHolders, 
    isLoading: isLoadingNormal, 
    error: errorNormal,
    refetch: refetchNormal
  } = useDataFetching<TokenHoldersResponse>({
    fetchFn: async () => {
      return await fetchTokenHolders(tokenName);
    },
    refreshInterval: 60000,
    maxRetries: 3,
    dependencies: [tokenName]
  });

  const { 
    data: stakedHolders, 
    isLoading: isLoadingStaked, 
    error: errorStaked,
    refetch: refetchStaked
  } = useDataFetching<TokenHoldersResponse>({
    fetchFn: async () => {
      return await fetchStakedHolders();
    },
    refreshInterval: 60000,
    maxRetries: 3,
    dependencies: []
  });

  // Combiner les holders normaux et stakés
  const combinedHolders = { ...normalHolders?.holders, ...stakedHolders?.holders };
  const totalHoldersCount = (normalHolders?.holdersCount || 0) + (stakedHolders?.holdersCount || 0);

  return {
    holders: combinedHolders,
    holdersCount: totalHoldersCount,
    lastUpdate: Math.max(normalHolders?.lastUpdate || 0, stakedHolders?.lastUpdate || 0),
    token: normalHolders?.token || tokenName,
    isLoading: isLoadingNormal || isLoadingStaked,
    error: errorNormal || errorStaked,
    refetch: () => {
      refetchNormal();
      refetchStaked();
    }
  };
}
