import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchTokenHolders } from '../api';
import { TokenHolderCohort, TokenHolderRow, TokenHoldersPage } from '../types';

/**
 * Hypurrscan regenerates its holder snapshot every ~10 min and the backend
 * keeps the aggregate a few minutes: polling faster only re-reads the same
 * page.
 */
const HOLDERS_REFRESH_MS = 5 * 60_000;

const NO_ROWS: TokenHolderRow[] = [];
const NO_COHORTS: TokenHolderCohort[] = [];

/**
 * One page of a spot token's holders (largest first, spot + staked summed)
 * plus the holder count, summed balance and cohorts of every holder —
 * aggregated by the backend (`/market/holders/:token`).
 *
 * @param page starts at 0, like the tables' pagination
 */
export function useTokenHolders(tokenName: string, page = 0, rowsPerPage = 10) {
  const { data, isLoading, error, refetch } = useDataFetching<TokenHoldersPage>({
    fetchFn: (signal) => fetchTokenHolders(tokenName, page + 1, rowsPerPage, signal),
    refreshInterval: HOLDERS_REFRESH_MS,
    maxRetries: 3,
    dependencies: [tokenName, page, rowsPerPage],
  });

  return {
    holders: data?.holders ?? NO_ROWS,
    /** 0-based page `holders` belongs to (lags `page` while it loads). */
    rowsPage: (data?.pagination.page ?? 1) - 1,
    /** Page size `holders` was read with. */
    rowsLimit: data?.pagination.limit ?? rowsPerPage,
    /** Rows that can be paged through. */
    total: data?.pagination.total ?? 0,
    holdersCount: data?.holdersCount ?? 0,
    totalBalance: data?.totalBalance ?? 0,
    cohorts: data?.cohorts ?? NO_COHORTS,
    lastUpdate: data?.lastUpdate ?? 0,
    isLoading,
    error,
    refetch,
  };
}
