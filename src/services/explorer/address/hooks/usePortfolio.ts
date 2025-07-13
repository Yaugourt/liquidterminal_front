import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchPortfolio } from '../api';
import { PortfolioApiResponse } from '../types';

export function usePortfolio(address: string) {
  const { data, isLoading, error } = useDataFetching<PortfolioApiResponse>({
    fetchFn: () => {
      if (!address || address.trim() === '') {
        return Promise.resolve([]);
      }
      return fetchPortfolio(address);
    },
    dependencies: [address],
    refreshInterval: 30000,
  });
  return { data, isLoading, error };
} 