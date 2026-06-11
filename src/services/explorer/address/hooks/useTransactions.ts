import { FormattedUserTransaction, UseTransactionsResult } from '../types';
import { getUserTransactions } from '../api';
import { useDataFetching } from '@/hooks/useDataFetching';
import { formatNumber } from '@/lib/formatters/numberFormatting';
import { NumberFormatType } from '@/store/number-format.store';

export const HIP2_ADDRESS = "0xffffffffffffffffffffffffffffffffffffffff";

export const formatHash = (hash: string) => {
  if (!hash) return '-';
  return hash.length > 10 ? `${hash.slice(0, 5)}...${hash.slice(-3)}` : hash;
};

export const formatNumberValue = (value: string | number | null | undefined, format: NumberFormatType) => {
  if (!value) return '-';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '-';
  return formatNumber(num, format);
};

export const useTransactions = (address: string): UseTransactionsResult => {
  const { data, isLoading, error } = useDataFetching<FormattedUserTransaction[]>({
    fetchFn: () => getUserTransactions(address),
    dependencies: [address],
    refreshInterval: 120000
  });

  return {
    transactions: data,
    isLoading,
    error
  };
}; 