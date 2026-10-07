import { useDataFetching } from '@/hooks/useDataFetching';
import { loadAssetResolver, type AssetResolver } from '../assets';

/** Market, token and validator names for decoding actions; shared and refreshed every 5 min. */
export function useAssetResolver(): AssetResolver | null {
  const { data } = useDataFetching<AssetResolver>({
    fetchFn: () => loadAssetResolver(),
    refreshInterval: 300_000,
    maxRetries: 2,
  });
  return data ?? null;
}
