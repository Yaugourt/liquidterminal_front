import { useMemo } from 'react';
import { useDataFetching } from '@/hooks/useDataFetching';
import { REFRESH_INTERVALS } from '@/services/api/constants';
import { buildHip3Coin } from '@/lib/hip3/coin';
import {
  impactSpreadBps,
  oiNotionalUsd,
  oiUtilisation,
  oracleDeviationBps,
} from '@/lib/hip3/health';
import { fetchPerpDexs } from '../../perpDex/api';
import { PerpDex } from '../../perpDex/types';
import { fetchHip3DexCtxs } from '../api';
import { Hip3AssetCtx, Hip3AssetStatus } from '../types';

const SIBLING_COUNT = 6;

export interface Hip3AssetView {
  coin: string;
  dexId: string;
  ticker: string;

  /** Market context for this asset. Null while loading or when not found. */
  asset: Hip3AssetCtx | null;
  /** Venue record from `perpDexs` — deployer, permissions, fee recipient. */
  venue: PerpDex | null;
  /** Live sibling markets on the same DEX, busiest first, current one excluded. */
  siblings: Hip3AssetCtx[];
  /** Live market count on this venue, for the "N live / M" label. */
  liveCount: number;
  totalCount: number;

  status: Hip3AssetStatus;
  oracleDeviationBps: number | null;
  impactSpreadBps: number | null;
  /** Open interest converted to USD — never compare the raw field to a cap. */
  oiNotionalUsd: number | null;
  /** Operator OI cap in USD, from `perpDexs.assetToStreamingOiCap`. */
  oiCapUsd: number | null;
  /** 0..1 share of the cap in use, null when the cap is unknown. */
  oiUtilisation: number | null;
  /** Resolved oracle updater — falls back to the `setOracle` sub-deployer. */
  oracleUpdater: string | null;

  isLoading: boolean;
  error: Error | null;
  /** True when the coin resolves on no source at all. */
  notFound: boolean;
}

/**
 * Everything the HIP-3 asset page needs, from Hyperliquid only.
 *
 * Deliberately independent of the HypeDexer proxy: `/indexer/*` answers 402 when
 * the subscription lapses, and the identity, price, depth and venue of a market
 * must not disappear with it. HypeDexer-sourced modules are layered on top and
 * degrade on their own.
 */
export function useHip3AssetView(dexId: string, ticker: string): Hip3AssetView {
  const coin = buildHip3Coin(dexId, ticker);
  const normalisedDex = dexId.trim().toLowerCase();

  const {
    data: ctxs,
    isLoading: ctxLoading,
    error: ctxError,
  } = useDataFetching<Hip3AssetCtx[]>({
    fetchFn: () => fetchHip3DexCtxs(normalisedDex),
    refreshInterval: REFRESH_INTERVALS.FAST,
    dependencies: [normalisedDex],
  });

  // Venue metadata is near-static (deployer, permissions, OI caps) — poll it
  // far slower than price context.
  const { data: perpDexs, isLoading: dexLoading } = useDataFetching<PerpDex[]>({
    fetchFn: fetchPerpDexs,
    refreshInterval: REFRESH_INTERVALS.HOURLY,
    dependencies: [],
  });

  return useMemo(() => {
    const all = ctxs ?? [];
    // Match by name, case-insensitively — never by array position.
    const asset = all.find((a) => a.coin.toLowerCase() === coin.toLowerCase()) ?? null;

    const venue =
      perpDexs?.find((d) => d.name.toLowerCase() === normalisedDex) ?? null;

    const liveAssets = all.filter((a) => !a.isDelisted);
    const siblings = liveAssets
      .filter((a) => a.coin.toLowerCase() !== coin.toLowerCase())
      .sort((a, b) => b.dayNtlVlm - a.dayNtlVlm)
      .slice(0, SIBLING_COUNT);

    const oiCapUsd =
      venue?.assets.find((a) => a.name.toLowerCase() === coin.toLowerCase())?.streamingOiCap ??
      null;

    const notional = asset ? oiNotionalUsd(asset.openInterest, asset.markPx) : null;

    // `oracleUpdater` is null on the largest venues (xyz among them) even though
    // an address does hold the permission. Without this fallback the venue card
    // would read "no oracle" on half the ecosystem.
    const oracleUpdater =
      venue?.oracleUpdater ||
      venue?.subDeployers.find((p) => p.permission === 'setOracle')?.addresses[0] ||
      null;

    const isLoading = ctxLoading || dexLoading;
    let status: Hip3AssetStatus = 'unknown';
    if (asset) status = asset.isDelisted ? 'delisted' : 'live';

    return {
      coin,
      dexId: normalisedDex,
      ticker: ticker.trim().toUpperCase(),
      asset,
      venue,
      siblings,
      liveCount: liveAssets.length,
      totalCount: all.length,
      status,
      oracleDeviationBps: asset ? oracleDeviationBps(asset.markPx, asset.oraclePx) : null,
      impactSpreadBps: asset
        ? impactSpreadBps(asset.impactBid, asset.impactAsk, asset.midPx)
        : null,
      oiNotionalUsd: notional,
      oiCapUsd,
      oiUtilisation: notional !== null ? oiUtilisation(notional, oiCapUsd) : null,
      oracleUpdater,
      isLoading,
      error: ctxError,
      notFound: !isLoading && !ctxError && asset === null,
    };
  }, [ctxs, perpDexs, coin, normalisedDex, ticker, ctxLoading, dexLoading, ctxError]);
}
