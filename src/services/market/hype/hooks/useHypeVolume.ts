import { useDataFetching } from '@/hooks/useDataFetching';
import { REFRESH_INTERVALS } from '@/services/api/constants';
import { fetchHypeDayVolume } from '../api';

/** HYPE 24h spot notional volume (USD), refreshed on the static cadence. */
export function useHypeVolume(): { volume: number | null; isLoading: boolean } {
  const { data, isLoading } = useDataFetching<number>({
    fetchFn: fetchHypeDayVolume,
    refreshInterval: REFRESH_INTERVALS.STATIC,
    dependencies: [],
    maxRetries: 2,
  });
  return { volume: data, isLoading };
}
