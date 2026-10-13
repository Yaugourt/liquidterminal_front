import { useCallback, useMemo, useState } from 'react';
import { useDataFetching } from '@/hooks/useDataFetching';
import { REFRESH_INTERVALS } from '@/services/api/constants';
import { fetchEvmTransactions } from '../api';
import type { EvmTransactionsPage, EvmTransactionsParams } from '../types';

const DEFAULT_PAGE_SIZE = 25;

/**
 * Decoded HyperEVM transactions, paginated and filtered server-side. No
 * polling — a cold upstream fetch can take 30 s, refresh is manual only. One
 * attempt per load (the fetcher skips transport retries too): a slow or
 * unconfigured upstream surfaces its notice, with Retry, instead of being
 * asked again for minutes.
 */
export const useEvmTransactions = (address: string, pageSize = DEFAULT_PAGE_SIZE) => {
  const [params, setParams] = useState<EvmTransactionsParams>({ page: 1, offset: pageSize });

  const { data, isLoading, isRefreshing, error, dataUpdatedAt, refetch } = useDataFetching<EvmTransactionsPage | null>({
    fetchFn: () => (address ? fetchEvmTransactions(address, params) : Promise.resolve(null)),
    dependencies: [address, params.page, params.offset, params.search, params.type, params.startDate, params.endDate],
    refreshInterval: REFRESH_INTERVALS.DISABLED,
    maxRetries: 0,
  });

  const updateParams = useCallback((next: Partial<EvmTransactionsParams>) => {
    setParams((prev) => {
      const merged = { ...prev, ...next };
      // Any filter change restarts from the first page — clearing one
      // (`{ search: undefined }`) included, hence key presence, not value.
      const filterChanged = 'search' in next || 'type' in next || 'startDate' in next || 'endDate' in next;
      return filterChanged && next.page === undefined ? { ...merged, page: 1 } : merged;
    });
  }, []);

  return useMemo(
    () => ({
      transactions: data?.transactions ?? [],
      total: data?.total ?? 0,
      page: params.page,
      pageSize: params.offset,
      hasMore: data?.hasMore ?? false,
      params,
      updateParams,
      isLoading,
      isRefreshing,
      error,
      dataUpdatedAt,
      refetch,
    }),
    [data, params, updateParams, isLoading, isRefreshing, error, dataUpdatedAt, refetch]
  );
};
