import { useDataFetching } from '@/hooks/useDataFetching';
import { getAddressActivity } from '../api';
import type { Activity } from '../decode';

/** Readable activity feed of an address (trades, orders, transfers, staking, vaults, settings). */
export function useAddressActivity(address: string) {
  const { data, isLoading, error, refetch, dataUpdatedAt } = useDataFetching<Activity[]>({
    fetchFn: () => getAddressActivity(address),
    dependencies: [address],
    // New fills and transactions within 30 s; the heavy ledger is re-read
    // every 2 minutes (api.ts).
    refreshInterval: 30_000,
  });
  return { activity: data ?? [], isLoading, error, refetch, dataUpdatedAt };
}
