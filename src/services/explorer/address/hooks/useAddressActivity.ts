import { useDataFetching } from '@/hooks/useDataFetching';
import { getAddressActivity } from '../api';
import type { Activity } from '../decode';

/** Readable activity feed of an address (trades, orders, transfers, staking, vaults, settings). */
export function useAddressActivity(address: string) {
  const { data, isLoading, error, refetch, dataUpdatedAt } = useDataFetching<Activity[]>({
    fetchFn: () => getAddressActivity(address),
    dependencies: [address],
    refreshInterval: 120_000,
  });
  return { activity: data ?? [], isLoading, error, refetch, dataUpdatedAt };
}
