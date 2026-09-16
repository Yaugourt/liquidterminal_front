import { useCallback, useState } from 'react';
import { useDataFetching } from '@/hooks/useDataFetching';
import { REFRESH_INTERVALS } from '@/services/api/constants';
import { fetchWalletNfts } from '../api';
import type { WalletNftsPage } from '../types';

/** Wallet NFTs (paginated). Upstream caches for two hours; no polling here. */
export const useWalletNfts = (address: string, limit = 24) => {
  const [page, setPage] = useState(1);
  const { data, isLoading, isRefreshing, error, dataUpdatedAt, refetch } = useDataFetching<WalletNftsPage | null>({
    fetchFn: () => (address ? fetchWalletNfts(address, page, limit) : Promise.resolve(null)),
    dependencies: [address, page, limit],
    refreshInterval: REFRESH_INTERVALS.DISABLED,
    maxRetries: 1,
  });
  const goToPage = useCallback((next: number) => setPage(Math.max(1, next)), []);
  return {
    nfts: data?.nfts ?? [],
    page,
    totalItems: data?.totalItems ?? 0,
    totalPages: data?.totalPages ?? 0,
    hasNextPage: data?.hasNextPage ?? false,
    totalValue: data?.totalValue ?? 0,
    goToPage,
    isLoading,
    isRefreshing,
    error,
    dataUpdatedAt,
    refetch,
  };
};
