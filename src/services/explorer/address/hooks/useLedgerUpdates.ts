import { useDataFetching } from '@/hooks/useDataFetching';
import { getUserNonFundingLedgerHistory } from '../api';
import type { NonFundingLedgerHistory, NonFundingLedgerUpdate } from '../types';

/** 5 × 2,000 rows: enough for nearly every wallet, bounded for hub/bot ones. */
const MAX_LEDGER_PAGES = 5;
const EMPTY: NonFundingLedgerUpdate[] = [];

/**
 * The wallet's non-funding ledger (deposits, withdrawals, sub-account and
 * class transfers, vault moves, liquidations), oldest → newest as HL returns
 * it, paged past HL's 2,000-row answer (`truncated` when the page cap is hit).
 * Refreshed every 120s, in step with `useTransactions`, which reads the same
 * first page — the two polls share it.
 */
export function useLedgerUpdates(address: string) {
  const { data, isLoading, error } = useDataFetching<NonFundingLedgerHistory>({
    fetchFn: () =>
      address
        ? getUserNonFundingLedgerHistory(address, MAX_LEDGER_PAGES)
        : Promise.resolve({ updates: EMPTY, truncated: false }),
    dependencies: [address],
    refreshInterval: 120000,
    maxRetries: 2,
  });
  return { updates: data?.updates ?? EMPTY, truncated: data?.truncated ?? false, isLoading, error };
}
