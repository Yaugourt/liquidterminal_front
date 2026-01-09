"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useRecentLiquidations, Liquidation } from "@/services/explorer/liquidation";
import { fetchAllLiquidationStats } from "@/services/explorer/liquidation/api";
import { LiquidationStats } from "@/services/explorer/liquidation/types";

type TimeframePeriod = 2 | 4 | 8 | 12 | 24;
type PeriodKey = "2h" | "4h" | "8h" | "12h" | "24h";

const periodToKey = (period: TimeframePeriod): PeriodKey => `${period}h` as PeriodKey;

interface LiquidationsContextValue {
  // Raw data for chart and table (2h)
  liquidations: Liquidation[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  
  // Period selection
  selectedPeriod: TimeframePeriod;
  setSelectedPeriod: (period: TimeframePeriod) => void;
  
  // Stats (from /stats/all endpoint, loaded once)
  stats: LiquidationStats;
  statsLoading: boolean;
  statsError: string[] | null;
}

const defaultStats: LiquidationStats = {
  totalVolume: 0,
  liquidationsCount: 0,
  longCount: 0,
  shortCount: 0,
  topCoin: '-',
  topCoinVolume: 0,
};

const LiquidationsContext = createContext<LiquidationsContextValue | null>(null);

// Cache global - persiste entre les remontages (StrictMode safe)
let globalAllStats: Record<PeriodKey, LiquidationStats | null> | null = null;
let isLoadingGlobal = false;
let hasLoadedGlobal = false;

export function LiquidationsProvider({ children }: { children: ReactNode }) {
  const [selectedPeriod, setSelectedPeriod] = useState<TimeframePeriod>(2);
  const [allStats, setAllStats] = useState<Record<PeriodKey, LiquidationStats | null> | null>(globalAllStats);
  const [statsLoading, setStatsLoading] = useState(!hasLoadedGlobal);
  const [statsError, setStatsError] = useState<string[] | null>(null);
  
  // Requête pour les liquidations récentes (tableau et chart)
  const { liquidations, isLoading, error, refetch } = useRecentLiquidations({
    limit: 1000,
    hours: 2
  });

  // Charger toutes les stats en UN SEUL appel au montage
  useEffect(() => {
    // Protection contre les appels multiples (StrictMode safe)
    if (hasLoadedGlobal || isLoadingGlobal) {
      // Utiliser le cache global si disponible
      if (globalAllStats) {
        setAllStats(globalAllStats);
        setStatsLoading(false);
      }
      return;
    }
    
    isLoadingGlobal = true;

    const loadAllStats = async () => {
      setStatsLoading(true);
      try {
        const response = await fetchAllLiquidationStats();
        if (response.success) {
          globalAllStats = response.stats;
          setAllStats(response.stats);
          if (response.errors && response.errors.length > 0) {
            setStatsError(response.errors);
          }
        }
      } catch (err) {
        console.error('Error fetching all liquidation stats:', err);
        setStatsError(['Failed to load stats']);
      } finally {
        hasLoadedGlobal = true;
        isLoadingGlobal = false;
        setStatsLoading(false);
      }
    };

    loadAllStats();
  }, []);

  // Stats actives basées sur la période sélectionnée
  const periodKey = periodToKey(selectedPeriod);
  const stats = allStats?.[periodKey] || defaultStats;

  const value: LiquidationsContextValue = {
    liquidations,
    isLoading,
    error,
    refetch,
    selectedPeriod,
    setSelectedPeriod,
    stats,
    statsLoading,
    statsError,
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

// Export timeframe options for UI
export const TIMEFRAME_OPTIONS: { value: TimeframePeriod; label: string }[] = [
  { value: 2, label: "2h" },
  { value: 4, label: "4h" },
  { value: 8, label: "8h" },
  { value: 12, label: "12h" },
  { value: 24, label: "24h" },
];

export type { TimeframePeriod };
