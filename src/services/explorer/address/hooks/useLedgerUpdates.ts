import { useDataFetching } from '@/hooks/useDataFetching';
import { getUserNonFundingLedgerUpdates } from '../api';
import type { NonFundingLedgerUpdate } from '../types';

/**
 * The wallet's non-funding ledger (deposits, withdrawals, sub-account and
 * class transfers, vault moves, liquidations), oldest → newest as HL returns
 * it. Static-ish data: refreshed every 60s.
 */
export function useLedgerUpdates(address: string) {
  const { data, isLoading, error } = useDataFetching<NonFundingLedgerUpdate[]>({
    fetchFn: () => (address ? getUserNonFundingLedgerUpdates(address) : Promise.resolve([])),
    dependencies: [address],
    refreshInterval: 60000,
    maxRetries: 2,
  });
  return { updates: data ?? [], isLoading, error };
}
