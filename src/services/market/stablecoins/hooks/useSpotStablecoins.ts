import { useMemo } from 'react';
import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchSpotStablecoins } from '../api';
import {
  SpotUsdcResponse,
  Stablecoin,
  StablecoinSupplyByCoinPoint,
  StablecoinSupplyPoint,
  UseSpotStablecoinsResult,
} from '../types';

/**
 * Age past which the latest point counts as stale. Hypurrscan rewrites the
 * running point every few minutes and the backend re-reads it every minute,
 * but serves its last copy (200) when Hypurrscan or its poller fails.
 */
const STALE_AFTER_MS = 30 * 60 * 1000;

/**
 * Hook des stablecoins on-spot (Hypurrscan `/spotUSDC`, lue via le backend).
 *
 * Lit la dernière entrée de la série et la normalise en liste de stablecoins
 * (USDC, USDH, USDT0, USDE) triés par supply décroissante.
 */
export function useSpotStablecoins(refreshInterval = 60000): UseSpotStablecoinsResult {
  const { data, isLoading, isRefreshing, error, isStale: refreshFailed, refetch, dataUpdatedAt } = useDataFetching<SpotUsdcResponse>({
    fetchFn: fetchSpotStablecoins,
    dependencies: [],
    refreshInterval,
  });

  const latest = data && data.length > 0 ? data[data.length - 1] : null;

  // Freshness from the series itself, not from the fetch: a frozen backend
  // copy answers 200 on every poll. Re-evaluated on each poll's re-render.
  const latestMs = latest ? latest.lastUpdate * 1000 : null;
  const isStale = latestMs != null && Date.now() - latestMs > STALE_AFTER_MS;
  const feedError = useMemo<Error | null>(() => {
    if (error) return error;
    if (!isStale || latestMs == null) return null;
    const minutes = Math.round((Date.now() - latestMs) / 60_000);
    return new Error(`Stablecoin series is stale: latest point ${minutes} min old`);
  }, [error, isStale, latestMs]);

  const supplyChart = useMemo<StablecoinSupplyPoint[]>(() => {
    if (!data) return [];
    return data.map((e) => ({
      time: e.lastUpdate * 1000,
      value:
        (e.totalSpotUSDC ?? 0) +
        (e.totalSpotUSDT0 ?? 0) +
        (e.totalSpotUSDE ?? 0) +
        (e.totalSpotUSDH ?? 0),
    }));
  }, [data]);

  const supplyHistory = useMemo<number[]>(
    () => supplyChart.slice(-48).map((p) => p.value),
    [supplyChart]
  );

  const supplyByCoinChart = useMemo<StablecoinSupplyByCoinPoint[]>(() => {
    if (!data) return [];
    return data.map((e) => ({
      time: e.lastUpdate * 1000,
      USDC: e.totalSpotUSDC ?? 0,
      USDH: e.totalSpotUSDH ?? 0,
      USDT0: e.totalSpotUSDT0 ?? 0,
      USDE: e.totalSpotUSDE ?? 0,
    }));
  }, [data]);

  const stablecoins = useMemo<Stablecoin[]>(() => {
    if (!latest) return [];
    return [
      { symbol: 'USDC', supply: latest.totalSpotUSDC ?? 0, holders: latest.USDC_holdersCount ?? 0 },
      { symbol: 'USDH', supply: latest.totalSpotUSDH ?? 0, holders: latest.USDH_holdersCount ?? 0 },
      { symbol: 'USDT0', supply: latest.totalSpotUSDT0 ?? 0, holders: latest.USDT0_holdersCount ?? 0 },
      { symbol: 'USDE', supply: latest.totalSpotUSDE ?? 0, holders: latest.USDE_holdersCount ?? 0 },
    ]
      .filter((s) => s.supply > 0)
      .sort((a, b) => b.supply - a.supply);
  }, [latest]);

  return {
    stablecoins,
    supplyHistory,
    supplyChart,
    supplyByCoinChart,
    lastUpdate: latest?.lastUpdate ?? null,
    isLoading,
    isRefreshing,
    error: feedError,
    // Old data either way: a frozen series, or a failed refresh (kept data).
    isStale: isStale || refreshFailed,
    refetch,
    dataUpdatedAt: latestMs ?? dataUpdatedAt,
  };
}
