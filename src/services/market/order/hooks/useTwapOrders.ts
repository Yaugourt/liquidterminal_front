import { useState, useCallback, useMemo } from 'react';
import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchTwapSource, selectTwapOrders, type TwapSource } from '../api';
import { enrichTwaps, type TwapBase } from '../twap-source';
import { useTwapLive } from './useTwapLive';
import {
  EnrichedTwapOrder,
  TwapLiveView,
  TwapOrderParams,
  TwapOrderPaginatedResponse,
  UseTwapOrdersOptions,
  UseTwapOrdersResult
} from '../types';

/**
 * One enrichment shared by every hook of the page: they all see the same
 * polled base and the same feed within the same second, so the dashboard's
 * five TWAP widgets cost one pass over the list, not five.
 */
let enrichMemo: { base: TwapBase; live: TwapLiveView; sec: number; orders: EnrichedTwapOrder[] } | null = null;

function enrichShared(base: TwapBase, live: TwapLiveView): EnrichedTwapOrder[] {
  const now = Date.now();
  const sec = Math.floor(now / 1000);
  if (
    enrichMemo &&
    enrichMemo.base === base &&
    enrichMemo.live.entries === live.entries &&
    enrichMemo.live.connected === live.connected &&
    enrichMemo.sec === sec
  ) {
    return enrichMemo.orders;
  }
  const orders = enrichTwaps(base, live, now);
  enrichMemo = { base, live, sec, orders };
  return orders;
}

export function useTwapOrders({
  limit = 50,
  status = "all",
  defaultParams = {},
  initialData,
  live: withLive = true
}: UseTwapOrdersOptions = {}): UseTwapOrdersResult {
  const [params, setParams] = useState<TwapOrderParams>(() => ({
    limit,
    status,
    sortBy: defaultParams.sortBy || 'time',
    sortOrder: defaultParams.sortOrder || 'desc',
    page: defaultParams.page || 1,
    ...defaultParams,
  }));

  // The polled list is the base and the fallback: only the status reaches the
  // wire (the Hypurrscan fallback), the rest is selected below, so a live
  // update re-selects without any request.
  const {
    data: source,
    isLoading,
    error,
    isStale,
    refetch
  } = useDataFetching<TwapSource>({
    fetchFn: (signal) => fetchTwapSource(params.status, signal),
    // The polled list stays the base: the live feed pushes new and ended TWAPs
    // and the executed amounts within seconds; this poll re-anchors them.
    refreshInterval: 15000,
    maxRetries: 3,
    dependencies: [params.status],
  });

  // The live feed rides on the indexer source only: the Hypurrscan fallback stays as it was.
  const indexed = source?.kind === 'indexer';
  const feed = useTwapLive(withLive && indexed);
  const isLive = indexed && feed.connected;

  const response = useMemo<TwapOrderPaginatedResponse | undefined>(() => {
    if (!source) {
      if (!initialData) return undefined;
      return {
        data: initialData,
        pagination: {
          total: initialData.length,
          page: 1,
          limit: initialData.length,
          totalPages: 1,
          totalVolume: initialData.reduce((sum, order) => sum + order.totalValueUSD, 0)
        }
      };
    }
    if (source.kind === 'fallback') return selectTwapOrders(source.orders, params, source.fetchedAt);
    const view: TwapLiveView = { entries: feed.entries, connected: feed.connected };
    // The latest of the poll and the last push.
    return selectTwapOrders(
      enrichShared(source.base, view),
      params,
      Math.max(source.base.fetchedAt, feed.updatedAt ?? 0)
    );
  }, [source, params, initialData, feed.entries, feed.connected, feed.updatedAt]);

  const updateParams = useCallback((newParams: Partial<TwapOrderParams>) => {

    setParams(prev => ({ ...prev, ...newParams }));
  }, []);

  // Memoized results
  const results = useMemo(() => ({
    orders: response?.data || [],
    total: response?.pagination.total || 0,
    page: response?.pagination.page || 1,
    totalPages: response?.pagination.totalPages || 0,
    totalVolume: response?.pagination.totalVolume || 0,
    metadata: response?.metadata,
    isLoading,
    error,
    isStale,
    isLive,
    updateParams,
    refetch
  }), [response, isLoading, error, isStale, isLive, updateParams, refetch]);

  return results;
}
