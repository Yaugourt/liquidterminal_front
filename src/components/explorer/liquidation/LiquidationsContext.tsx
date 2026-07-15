"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useMemo, useCallback, useRef } from "react";
import { Liquidation } from "@/services/explorer/liquidation";
import { fetchRecentLiquidations, fetchLiquidationsData, fetchLiquidationsHistoricalChart } from "@/services/explorer/liquidation/api";
import { useLiquidationWSStore } from "@/services/explorer/liquidation/websocket.store";
import { LiquidationStats, ChartDataBucket, HistoricalChartBucket, HistoricalChartPeriod, LiquidationsPeriodData } from "@/services/explorer/liquidation/types";

type PeriodKey = "2h" | "4h" | "8h" | "12h" | "24h";

// Min amount filter presets
export type MinAmountPreset = 0 | 1000 | 10000 | 100000;
export const MIN_AMOUNT_PRESETS: { value: MinAmountPreset; label: string }[] = [
  { value: 0, label: "All" },
  { value: 1000, label: "$1K+" },
  { value: 10000, label: "$10K+" },
  { value: 100000, label: "$100K+" },
];

// Chart period options: the windows accepted by /liquidations/historical/chart
export const CHART_PERIOD_OPTIONS: { value: HistoricalChartPeriod; label: string }[] = [
  { value: "24h", label: "24h" },
  { value: "7d", label: "7d" },
  { value: "14d", label: "14d" },
  { value: "30d", label: "30d" },
  { value: "90d", label: "90d" },
];

/** Map a /liquidations/historical/chart bucket to the internal chart bucket shape. */
const mapHistoricalBucket = (bucket: HistoricalChartBucket): ChartDataBucket => ({
  timestamp: bucket.timestamp,
  timestampMs: Date.parse(bucket.timestamp),
  totalVolume: bucket.totalVolume_USD,
  longVolume: bucket.longVolume_USD,
  shortVolume: bucket.shortVolume_USD,
  liquidationsCount: bucket.count,
  longCount: bucket.longCount,
  shortCount: bucket.shortCount,
});

interface LiquidationsContextValue {
  // Liquidations data (initial from API + realtime from WS)
  liquidations: Liquidation[];
  filteredLiquidations: Liquidation[];
  isLoading: boolean;
  error: Error | null;

  // WebSocket status
  isConnected: boolean;
  isSubscribed: boolean;

  // Min amount filter (Table only)
  minAmount: MinAmountPreset;
  setMinAmount: (amount: MinAmountPreset) => void;

  // Stats from the unified endpoint. The backend returns identical stats for
  // every window it advertises, so a single 24h snapshot is exposed (no
  // period selector; see LiquidationsStatsCard).
  stats: LiquidationStats;
  statsLoading: boolean;

  // Chart data (from /liquidations/historical/chart, fetched per period)
  chartBuckets: ChartDataBucket[];
  chartLoading: boolean;
  chartPeriod: HistoricalChartPeriod;
  setChartPeriod: (period: HistoricalChartPeriod) => void;

  // Last update info
  lastUpdated: Date | null;

  /** Manual refresh: refetch table + stats/chart without toggling initial loading (keeps WS connected). */
  refreshData: () => Promise<void>;
}

const defaultStats: LiquidationStats = {
  totalVolume: 0,
  liquidationsCount: 0,
  longCount: 0,
  shortCount: 0,
  topCoin: '-',
  topCoinVolume: 0,
  avgSize: 0,
  maxLiq: 0,
  longVolume: 0,
  shortVolume: 0,
};

const LiquidationsContext = createContext<LiquidationsContextValue | null>(null);

const MAX_LIQUIDATIONS = 1000;

export function LiquidationsProvider({ children }: { children: ReactNode }) {
  const [chartPeriod, setChartPeriod] = useState<HistoricalChartPeriod>("7d");
  const [minAmount, setMinAmount] = useState<MinAmountPreset>(0);

  // Initial data loaded from the API
  const [liquidations, setLiquidations] = useState<Liquidation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Stats data (unified endpoint)
  const [allData, setAllData] = useState<Record<PeriodKey, LiquidationsPeriodData> | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  // Chart buckets (historical chart endpoint, refetched per period)
  const [chartBuckets, setChartBuckets] = useState<ChartDataBucket[]>([]);
  const [chartLoading, setChartLoading] = useState(true);

  // Track if initial load is done
  const hasLoadedRef = useRef(false);
  
  // WebSocket store
  const { 
    isConnected, 
    isSubscribed, 
    connect: wsConnect, 
    disconnect: wsDisconnect,
    setOnLiquidation 
  } = useLiquidationWSStore();

  // Callback pour les nouvelles liquidations via WebSocket
  const handleNewLiquidation = useCallback((newLiq: Liquidation) => {
    setLiquidations(prev => {
      // Éviter les doublons (même tid)
      if (prev.some(l => l.tid === newLiq.tid)) {
        return prev;
      }
      // Ajouter en tête, limiter la taille
      return [newLiq, ...prev].slice(0, MAX_LIQUIDATIONS);
    });
    setLastUpdated(new Date());
  }, []);

  // Charger les données initiales via API (UNE SEULE FOIS)
  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const loadInitialData = async () => {
      setIsLoading(true);
      setDataLoading(true);

      try {
        // Charger en parallèle : liquidations récentes + stats/chart
        const [liquidationsResponse, dataResponse] = await Promise.all([
          fetchRecentLiquidations({ limit: 1000, hours: 2 }),
          fetchLiquidationsData()
        ]);

        // Liquidations pour le tableau
        if (liquidationsResponse.success) {
          setLiquidations(liquidationsResponse.data);
        }

        // Stats + Chart pour toutes les périodes
        if (dataResponse.success) {
          setAllData(dataResponse.periods);
        }

        setLastUpdated(new Date());
        setError(null);
      } catch (err) {
        console.error('Error loading initial liquidations data:', err);
        setError(err instanceof Error ? err : new Error('Failed to load data'));
      } finally {
        setIsLoading(false);
        setDataLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Activer le WebSocket après le chargement initial
  useEffect(() => {
    if (isLoading) return;

    setOnLiquidation(handleNewLiquidation);
    wsConnect();

    return () => {
      setOnLiquidation(undefined);
      wsDisconnect();
    };
  }, [isLoading, handleNewLiquidation, setOnLiquidation, wsConnect, wsDisconnect]);

  // Periodically refresh stats so the panel stays current
  useEffect(() => {
    if (isLoading) return;

    const REFRESH_INTERVAL = 60_000;
    const intervalId = setInterval(async () => {
      try {
        const dataResponse = await fetchLiquidationsData();
        if (dataResponse.success) {
          setAllData(dataResponse.periods);
          setLastUpdated(new Date());
        }
      } catch {
        // Silent: the initial data remains visible; next tick retries
      }
    }, REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, [isLoading]);

  // Chart buckets from the local DB endpoint (the robust liquidations source).
  // Fetched on mount and whenever the period changes, then refreshed every
  // 60s (matches the endpoint cache TTL).
  useEffect(() => {
    let cancelled = false;

    const loadChart = async (initial: boolean) => {
      if (initial) setChartLoading(true);
      try {
        const response = await fetchLiquidationsHistoricalChart(chartPeriod);
        if (!cancelled && response.success) {
          setChartBuckets(response.data.buckets.map(mapHistoricalBucket));
        }
      } catch {
        // Silent: previous buckets stay visible; next tick retries
      } finally {
        if (!cancelled && initial) setChartLoading(false);
      }
    };

    loadChart(true);
    const intervalId = setInterval(() => loadChart(false), 60_000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [chartPeriod]);

  const refreshData = useCallback(async () => {
    try {
      const [liquidationsResponse, dataResponse] = await Promise.all([
        fetchRecentLiquidations({ limit: 1000, hours: 2 }),
        fetchLiquidationsData(),
      ]);
      if (liquidationsResponse.success) {
        setLiquidations(liquidationsResponse.data);
      }
      if (dataResponse.success) {
        setAllData(dataResponse.periods);
      }
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load data"));
    }
  }, []);

  // Filtrer les liquidations par montant minimum (pour le tableau)
  const filteredLiquidations = useMemo(() => {
    if (minAmount === 0) return liquidations;
    return liquidations.filter(liq => liq.notional_total >= minAmount);
  }, [liquidations, minAmount]);

  // Single 24h stats snapshot. The backend duplicates the same stats across
  // every window it returns, so exposing a per-window selector would be fake.
  const stats = allData?.["24h"]?.stats || defaultStats;

  const value: LiquidationsContextValue = {
    liquidations,
    filteredLiquidations,
    isLoading,
    error,
    isConnected,
    isSubscribed,
    minAmount,
    setMinAmount,
    stats,
    statsLoading: dataLoading,
    chartBuckets,
    chartLoading,
    chartPeriod,
    setChartPeriod,
    lastUpdated,
    refreshData,
  };

  return (
    <LiquidationsContext.Provider value={value}>
      {children}
    </LiquidationsContext.Provider>
  );
}

export function useLiquidationsContext() {
  const context = useContext(LiquidationsContext);
  if (!context) {
    throw new Error("useLiquidationsContext must be used within LiquidationsProvider");
  }
  return context;
}
