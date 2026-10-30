import { useMemo } from 'react';
import { useDataFetching } from '@/hooks/useDataFetching';
import type { ParsedPerpMetas } from '../api';
import type { AssetMarketData } from '../types';
import { usePerpDexMarketDataStore } from '../websocket.service';
import { loadAllPerpMetas } from './usePerpDexMarketData';

const NO_ASSETS: AssetMarketData[] = [];
const loadNothing = async (): Promise<null> => null;

/** Live figures of one native perp, in the units of the polled `/market/perp` row. */
export interface NativePerpLive {
  /** Mark price (USD). */
  price: number;
  /** 24h change in percent. */
  change24h: number;
  /** 24h notional volume (USD). */
  volume: number;
}

/**
 * Live price, 24h change and volume of the native perps by coin name, from the
 * native contexts of the allDexsAssetCtxs socket (a frame every ~4.7 s).
 *
 * `enabled` false makes it inert (always null); so does a socket that is down
 * (the last frame is kept in the store, but the polled rows are then fresher).
 *
 * Read-only on the socket: it never connects it, so on a page where no other
 * component holds the socket this stays null and the polled rows stand. The
 * coin names come from `allPerpMetas[0]` (shared 5 min download, the same
 * copy the HIP-3 views use); the contexts are indexed against that same
 * universe. New listings append, so a meta older than the frame still names
 * the indexes it knows and the rest are left out.
 */
export function useNativePerpLive(enabled: boolean): Map<string, NativePerpLive> | null {
  // A disabled caller (the spot card of a shared component) neither reads the
  // frames nor asks for the meta, so it is never re-rendered by the socket.
  const nativeAssets = usePerpDexMarketDataStore((s) => (enabled && s.isConnected ? s.nativeAssets : NO_ASSETS));
  const { data: metas } = useDataFetching<ParsedPerpMetas | null>({
    fetchFn: enabled ? loadAllPerpMetas : loadNothing,
    refreshInterval: enabled ? 60000 : 0, // Picks up the shared copy's refresh within a minute
    dependencies: [enabled],
    maxRetries: 3,
  });

  return useMemo(() => {
    if (!metas || nativeAssets.length === 0) return null;
    const live = new Map<string, NativePerpLive>();
    const known = Math.min(metas.nativeNames.length, nativeAssets.length);
    for (let i = 0; i < known; i++) {
      const asset = nativeAssets[i];
      if (asset.markPx <= 0) continue;
      live.set(metas.nativeNames[i], {
        price: asset.markPx,
        change24h: asset.priceChange24h,
        volume: asset.dayNtlVlm,
      });
    }
    return live;
  }, [metas, nativeAssets]);
}
