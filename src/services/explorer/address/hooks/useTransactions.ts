import { FormattedUserTransaction, UseTransactionsResult } from '../types';
import { getUserTransactions } from '../api';
import { useDataFetching } from '@/hooks/useDataFetching';
import { formatNumber } from '@/lib/numberFormatting';
import { formatHip2Display } from '../utils';
import { NumberFormatType } from '@/store/number-format.store';

export const HIP2_ADDRESS = "0xffffffffffffffffffffffffffffffffffffffff";

// Business logic functions for formatting
export const formatAddress = (address: string) => {
  if (!address) return '-';
  const hip2Display = formatHip2Display(address);
  if (hip2Display === 'HIP2') return 'HIP2';
  return address.length > 14 ? `${address.slice(0, 8)}...${address.slice(-6)}` : address;
};

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
    refreshInterval: 60000
  });

  return {
    transactions: data,
    isLoading,
    error
  };
}; 