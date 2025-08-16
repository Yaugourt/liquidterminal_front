import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchTokenDetails } from '../api';
import { TokenDetails } from '../types';

export const useTokenDetails = (tokenId: string | null) => {
  const { 
    data, 
    isLoading, 
    error,
    refetch 
  } = useDataFetching<TokenDetails | null>({
    fetchFn: async () => {
      if (!tokenId) return null;
      return await fetchTokenDetails(tokenId);
    },
    refreshInterval: 60000, // Refresh every minute
    dependencies: [tokenId],
    maxRetries: 3,
    retryDelay: 1000
  });

  return {
    data,
    isLoading,
    error: error?.message || null,
    refetch
  };
};
