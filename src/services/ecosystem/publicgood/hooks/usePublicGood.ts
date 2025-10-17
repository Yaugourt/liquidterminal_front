import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchPublicGood } from '../api';
import { PublicGoodDetailResponse, PublicGood } from '../types';

export interface UsePublicGoodResult {
  publicGood: PublicGood | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const usePublicGood = (id: number | null): UsePublicGoodResult => {
  const { data, isLoading, error, refetch } = useDataFetching<PublicGoodDetailResponse>({
    fetchFn: async () => {
      if (!id) throw new Error('No ID provided');
      return await fetchPublicGood(id);
    },
    refreshInterval: 60000, // 60 seconds
    dependencies: [id],
    maxRetries: 3
  });

  return {
    publicGood: data?.data || null,
    isLoading: id ? isLoading : false,
    error: id ? error : null,
    refetch
  };
};

