import { FormattedUserTransaction, UseTransactionsResult, getUserTransactions, getUserNonFundingLedgerUpdates } from '../index';
import { useDataFetching } from '@/hooks/useDataFetching';
import { formatNumber } from '@/lib/formatting';
import { useNumberFormat } from '@/store/number-format.store';

const HIP2_ADDRESS = "0xffffffffffffffffffffffffffffffffffffffff";

// Business logic functions moved from TransactionList component
export const formatAddress = (address: string) => {
  if (!address) return '-';
  if (address === HIP2_ADDRESS) return 'HIP2';
  return address.length > 14 ? `${address.slice(0, 8)}...${address.slice(-6)}` : address;
};

export const formatHash = (hash: string) => {
  if (!hash) return '-';
  return hash.length > 10 ? `${hash.slice(0, 5)}...${hash.slice(-3)}` : hash;
};

export const formatNumberValue = (value: string | number | null | undefined, format: any) => {
  if (!value) return '-';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '-';
  return formatNumber(num, format);
};

export const calculateValue = (amount: string | undefined, price: string | undefined, format: any) => {
  if (!amount || !price) return '-';
  const amountNum = parseFloat(amount);
  const priceNum = parseFloat(price);
  if (isNaN(amountNum) || isNaN(priceNum)) return '-';
  return formatNumber(amountNum * priceNum, format, {
    currency: '$',
    showCurrency: true
  });
};

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