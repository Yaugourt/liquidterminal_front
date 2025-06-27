import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchPortfolio, PortfolioApiResponse } from '../index';

export function usePortfolio(address: string) {
  const { data, isLoading, error } = useDataFetching<PortfolioApiResponse>({
    fetchFn: () => fetchPortfolio(address),
    dependencies: [address],
    refreshInterval: 0,
  });
  return { data, isLoading, error };
} 