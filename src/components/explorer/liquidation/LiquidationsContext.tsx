"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useMemo, useCallback } from "react";
import { useRecentLiquidations, Liquidation } from "@/services/explorer/liquidation";
import { fetchLiquidationsData } from "@/services/explorer/liquidation/api";
import { LiquidationStats, ChartDataBucket, ChartPeriod, LiquidationsPeriodData } from "@/services/explorer/liquidation/types";

type TimeframePeriod = 2 | 4 | 8 | 12 | 24;
type PeriodKey = "2h" | "4h" | "8h" | "12h" | "24h";

// Presets de filtre montant minimum
export type MinAmountPreset = 0 | 1000 | 10000 | 100000;
export const MIN_AMOUNT_PRESETS: { value: MinAmountPreset; label: string }[] = [
  { value: 0, label: "All" },
  { value: 1000, label: "$1K+" },
  { value: 10000, label: "$10K+" },
  { value: 100000, label: "$100K+" },
];

// Options de période pour le chart (mêmes que stats)
export const CHART_PERIOD_OPTIONS: { value: ChartPeriod; label: string }[] = [
  { value: "2h", label: "2h" },
  { value: "4h", label: "4h" },
  { value: "8h", label: "8h" },
  { value: "12h", label: "12h" },
  { value: "24h", label: "24h" },
];

const periodToKey = (period: TimeframePeriod): PeriodKey => `${period}h` as PeriodKey;

interface LiquidationsContextValue {
  // Raw data for table only (2h, 1000 max)
  liquidations: Liquidation[];
  filteredLiquidations: Liquidation[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  
  // Period selection for StatsCard
  selectedPeriod: TimeframePeriod;
  setSelectedPeriod: (period: TimeframePeriod) => void;
  
  // Min amount filter (Table only)
  minAmount: MinAmountPreset;
  setMinAmount: (amount: MinAmountPreset) => void;
  
  // Stats (from unified endpoint, instant switch)
  stats: LiquidationStats;
  statsLoading: boolean;
  
  // Chart data (from unified endpoint, instant switch)
  chartBuckets: ChartDataBucket[];
  chartLoading: boolean;
  chartInterval: string;
  chartPeriod: ChartPeriod;
  setChartPeriod: (period: ChartPeriod) => void;
  
  // Auto-refresh
  lastUpdated: Date | null;
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

// Cache global - persiste entre les remontages (StrictMode safe)
let globalAllData: Record<PeriodKey, LiquidationsPeriodData> | null = null;
let isLoadingGlobal = false;
let hasLoadedGlobal = false;

// Interval d'auto-refresh en ms (60 secondes)
const AUTO_REFRESH_INTERVAL = 60 * 1000;

export function LiquidationsProvider({ children }: { children: ReactNode }) {
  const [selectedPeriod, setSelectedPeriod] = useState<TimeframePeriod>(2);
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>("2h");
  const [minAmount, setMinAmount] = useState<MinAmountPreset>(0);
  
  // Données unifiées - toutes les périodes en mémoire
  const [allData, setAllData] = useState<Record<PeriodKey, LiquidationsPeriodData> | null>(globalAllData);
  const [dataLoading, setDataLoading] = useState(!hasLoadedGlobal);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Requête pour les liquidations récentes (tableau seulement)
  const { liquidations, isLoading, error, refetch } = useRecentLiquidations({
    limit: 1000,
    hours: 2
  });

  // Filtrer les liquidations par montant minimum (pour le tableau)
  const filteredLiquidations = useMemo(() => {
    if (minAmount === 0) return liquidations;
    return liquidations.filter(liq => liq.notional_total >= minAmount);
  }, [liquidations, minAmount]);

  // Fonction pour charger toutes les données (stats + chart) en UN appel
  const loadAllData = useCallback(async () => {
    setDataLoading(true);
    try {
      const response = await fetchLiquidationsData();
      if (response.success) {
        globalAllData = response.periods;
        setAllData(response.periods);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Error fetching liquidations data:', err);
    } finally {
      hasLoadedGlobal = true;
      isLoadingGlobal = false;
      setDataLoading(false);
    }
  }, []);

  // Fonction de refresh manuel
  const refreshData = useCallback(async () => {
    hasLoadedGlobal = false;
    isLoadingGlobal = false;
    await loadAllData();
    await refetch();
  }, [loadAllData, refetch]);

  // Charger toutes les données en UN SEUL appel au montage
  useEffect(() => {
    if (hasLoadedGlobal || isLoadingGlobal) {
      if (globalAllData) {
        setAllData(globalAllData);
        setDataLoading(false);
      }
      return;
    }
    
    isLoadingGlobal = true;
    loadAllData();
  }, [loadAllData]);

  // Auto-refresh toutes les 60 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      hasLoadedGlobal = false;
      isLoadingGlobal = false;
      loadAllData();
      refetch();
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [loadAllData, refetch]);

  // Stats actives basées sur la période sélectionnée (INSTANT - pas de fetch)
  const periodKey = periodToKey(selectedPeriod);
  const stats = allData?.[periodKey]?.stats || defaultStats;
  
  // Chart data basé sur chartPeriod (INSTANT - pas de fetch)
  const chartData = allData?.[chartPeriod as PeriodKey];
  const chartBuckets = chartData?.chart.buckets || [];
  const chartInterval = chartData?.chart.interval || "5m";

  const value: LiquidationsContextValue = {
    liquidations,
    filteredLiquidations,
    isLoading,
    error,
    refetch,
    selectedPeriod,
    setSelectedPeriod,
    minAmount,
    setMinAmount,
    stats,
    statsLoading: dataLoading,
    chartBuckets,
    chartLoading: dataLoading,
    chartInterval,
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

// Export timeframe options for UI (StatsCard)
export const TIMEFRAME_OPTIONS: { value: TimeframePeriod; label: string }[] = [
  { value: 2, label: "2h" },
  { value: 4, label: "4h" },
  { value: 8, label: "8h" },
  { value: 12, label: "12h" },
  { value: 24, label: "24h" },
];

export type { TimeframePeriod };
