import { FormattedUserTransaction, UseTransactionsResult, getUserTransactions } from '../index';
import { useDataFetching } from '@/hooks/useDataFetching';

export const useTransactions = (address: string): UseTransactionsResult => {
  const { data, isLoading, error } = useDataFetching<FormattedUserTransaction[]>({
    fetchFn: () => getUserTransactions(address),
    dependencies: [address],
    refreshInterval: 0 // Rafraîchir toutes les 30 secondes
  });

  return {
    transactions: data,
    isLoading,
    error
  };
}; 