import { useCallback, useMemo, useState } from "react";
import { useDataFetching } from "@/hooks/useDataFetching";
import { REFRESH_INTERVALS } from "@/services/api/constants";
import { cleanParams, stableKey } from "@/services/common/utils";
import type { BasePagination, PaginatedResponse } from "@/services/common/types";

/**
 * Standard backend pagination params (Prisma routes: leaderboard, builders, market, vaults, ...).
 * Cursor-based endpoints (liquidations, hypedexer fills) need their own hook — this is for
 * `?page=&limit=&sortBy=&sortOrder=` style routes.
 */
export interface PaginatedFetchParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  [extra: string]: unknown;
}

export interface UsePaginatedFetchOptions<
  T,
  P extends PaginatedFetchParams = PaginatedFetchParams
> {
  fetchFn: (params: P, signal?: AbortSignal) => Promise<PaginatedResponse<T>>;
  initialParams?: P;
  refreshInterval?: number;
  maxRetries?: number;
  retryDelay?: number;
}

const EMPTY_PAGINATION: BasePagination = {
  total: 0,
  page: 1,
  limit: 0,
  totalPages: 0,
  hasNext: false,
  hasPrevious: false,
};

export function usePaginatedFetch<
  T,
  P extends PaginatedFetchParams = PaginatedFetchParams
>({
  fetchFn,
  initialParams,
  refreshInterval = REFRESH_INTERVALS.DEFAULT,
  maxRetries,
  retryDelay,
}: UsePaginatedFetchOptions<T, P>) {
  const [params, setParams] = useState<P>((initialParams ?? ({} as P)));

  const cleaned = useMemo(() => cleanParams(params) as P, [params]);
  const depKey = useMemo(() => stableKey(cleaned), [cleaned]);

  const updateParams = useCallback((next: Partial<P>) => {
    setParams((prev) => ({ ...prev, ...next }));
  }, []);

  const setPage = useCallback((page: number) => updateParams({ page } as Partial<P>), [updateParams]);
  const setLimit = useCallback((limit: number) => updateParams({ limit } as Partial<P>), [updateParams]);
  const setSort = useCallback(
    (sortBy: string, sortOrder: "asc" | "desc" = "desc") =>
      updateParams({ sortBy, sortOrder } as Partial<P>),
    [updateParams]
  );

  const { data, isLoading, isInitialLoading, isRefreshing, error, refetch } =
    useDataFetching<PaginatedResponse<T>>({
      fetchFn: (signal) => fetchFn(cleaned, signal),
      refreshInterval,
      dependencies: [depKey],
      maxRetries,
      retryDelay,
    });

  return {
    data: data?.data ?? [],
    pagination: data?.pagination ?? EMPTY_PAGINATION,
    metadata: data?.metadata,
    params,
    isLoading,
    isInitialLoading,
    isRefreshing,
    error,
    refetch,
    updateParams,
    setPage,
    setLimit,
    setSort,
  };
}
