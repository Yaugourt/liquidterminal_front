"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useMemo, useCallback, useRef } from "react";
import { Liquidation } from "@/services/explorer/liquidation";
import { fetchRecentLiquidations, fetchLiquidationsData } from "@/services/explorer/liquidation/api";
import { useLiquidationWSStore } from "@/services/explorer/liquidation/websocket.store";
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
  // Liquidations data (initial from API + realtime from WS)
  liquidations: Liquidation[];
  filteredLiquidations: Liquidation[];
  isLoading: boolean;
  error: Error | null;
  
  // WebSocket status
  isConnected: boolean;
  isSubscribed: boolean;
  
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
  
  // Last update info
  lastUpdated: Date | null;
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
  const [selectedPeriod, setSelectedPeriod] = useState<TimeframePeriod>(2);
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>("2h");
  const [minAmount, setMinAmount] = useState<MinAmountPreset>(0);
  
  // Données initiales chargées via API
  const [liquidations, setLiquidations] = useState<Liquidation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Stats/Chart data
  const [allData, setAllData] = useState<Record<PeriodKey, LiquidationsPeriodData> | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  
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
    if (isLoading) return; // Attendre que l'API ait fini

    // Enregistrer le callback pour les nouvelles liquidations
    setOnLiquidation(handleNewLiquidation);
    
    // Connecter le WebSocket
    wsConnect();

    // Cleanup à la déconnexion
    return () => {
      setOnLiquidation(undefined);
      wsDisconnect();
    };
  }, [isLoading, handleNewLiquidation, setOnLiquidation, wsConnect, wsDisconnect]);

  // Filtrer les liquidations par montant minimum (pour le tableau)
  const filteredLiquidations = useMemo(() => {
    if (minAmount === 0) return liquidations;
    return liquidations.filter(liq => liq.notional_total >= minAmount);
  }, [liquidations, minAmount]);

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
    isConnected,
    isSubscribed,
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
