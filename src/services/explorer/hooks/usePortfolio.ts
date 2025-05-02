import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchPortfolio } from '../api';
import { PortfolioApiResponse } from '../types';

export function usePortfolio(address: string) {
  const { data, isLoading, error } = useDataFetching<PortfolioApiResponse>({
    fetchFn: () => fetchPortfolio(address),
    dependencies: [address],
    refreshInterval: 0,
  });
  return { data, isLoading, error };
} 