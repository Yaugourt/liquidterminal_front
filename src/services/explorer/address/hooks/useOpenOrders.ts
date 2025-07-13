import { useDataFetching } from '@/hooks/useDataFetching';
import { OpenOrdersResponse } from '../types';
import { getUserOpenOrders } from '../api';

export function useOpenOrders(address: string | undefined) {
  const { data, isLoading, error } = useDataFetching<OpenOrdersResponse>({
    fetchFn: () => address ? getUserOpenOrders(address) : Promise.resolve([]),
    dependencies: [address],
    refreshInterval: 30000 // Rafraîchir toutes les 30 secondes
  });

  return {
    data: data || [],
    isLoading,
    error
  };
} 