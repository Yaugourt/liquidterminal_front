import { useMemo } from 'react';
import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchTokenHolders, fetchStakedHolders } from '../api';
import { TokenHoldersResponse } from '../types';

const NO_HOLDERS: TokenHoldersResponse['holders'] = {};

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
      return await fetchStakedHolders(tokenName);
    },
    refreshInterval: 60000,
    maxRetries: 3,
    dependencies: [tokenName]
  });

  // Combiner les holders normaux et stakés. Memoised: HYPE has ~260k
  // holders, and a new map on every render of the page also defeats the
  // consumers' memos (HoldersTable re-sorted the whole list).
  const normal = normalHolders?.holders;
  const staked = stakedHolders?.holders;
  const combinedHolders = useMemo(() => ({ ...normal, ...staked }), [normal, staked]);
  const totalHoldersCount = (normalHolders?.holdersCount || 0) + (stakedHolders?.holdersCount || 0);

  return {
    holders: combinedHolders,
    holdersCount: totalHoldersCount,
    lastUpdate: Math.max(normalHolders?.lastUpdate || 0, stakedHolders?.lastUpdate || 0),
    token: normalHolders?.token || tokenName,
    stakedHolders: staked || NO_HOLDERS,
    isLoading: isLoadingNormal || isLoadingStaked,
    error: errorNormal || errorStaked,
    refetch: () => {
      refetchNormal();
      refetchStaked();
    }
  };
}
