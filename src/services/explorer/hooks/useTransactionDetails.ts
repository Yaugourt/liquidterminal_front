import { TransactionDetails, UseTransactionDetailsResult, fetchTransactionDetails } from '../index';
import { useDataFetching } from '@/hooks/useDataFetching';

export const useTransactionDetails = (txHash: string): UseTransactionDetailsResult => {
  const { data, isLoading, error } = useDataFetching<TransactionDetails>({
    fetchFn: () => fetchTransactionDetails(txHash).then(response => response.tx),
    dependencies: [txHash],
    refreshInterval: 0
  });

  return {
    transactionDetails: data,
    isLoading,
    error
  };
}; 