import { useMemo } from 'react';
import { UnstakingStatsResponse, UseUnstakingStatsWithChartResult, UnstakingDailyStats, UnstakingTotalStats, UpcomingUnstakingStats } from '../../types/staking';
import { fetchUnstakingStats } from '../../staking';
import { useDataFetching } from '@/hooks/useDataFetching';
import { ChartPeriod } from '@/components/common/charts/types/chart';

/**
 * Hook interne pour récupérer les statistiques d'unstaking par jour
 */
const useUnstakingStats = (): {
  dailyStats: UnstakingDailyStats[];
  totalStats: UnstakingTotalStats | null;
  upcomingUnstaking: UpcomingUnstakingStats | null;
  lastUpdate: number | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} => {
  const { data, isLoading, error, refetch } = useDataFetching<UnstakingStatsResponse>({
    fetchFn: fetchUnstakingStats,
    refreshInterval: 30000 // 30 secondes
  });

  return {
    dailyStats: data?.data?.dailyStats || [],
    totalStats: data?.data?.totalStats || null,
    upcomingUnstaking: data?.data?.upcomingUnstaking || null,
    lastUpdate: data?.data?.lastUpdate || null,
    isLoading,
    error,
    refetch
  };
};

/**
 * Hook pour récupérer les statistiques d'unstaking formatées pour la chart
 */
export const useUnstakingStatsForChart = (): UseUnstakingStatsWithChartResult => {
  const baseResult = useUnstakingStats();
  
  // Logique métier : traiter les données pour la chart - prendre les 10 derniers jours
  const chartData = useMemo(() => {
    if (!baseResult.dailyStats.length) return [];

    // Prendre les 10 derniers jours et les formater
    return baseResult.dailyStats
      .slice(-10)
      .map((stat: UnstakingDailyStats) => {
        const date = new Date(stat.date);
        const dayName = date.toLocaleDateString('fr-FR', { 
          weekday: 'short', 
          day: 'numeric', 
          month: 'short' 
        });
        
        return {
          day: dayName,
          date: stat.date,
          totalTokens: stat.totalTokens,
          transactionCount: stat.transactionCount,
          uniqueUsers: stat.uniqueUsers
        };
      });
  }, [baseResult.dailyStats]);

  return {
    ...baseResult,
    chartData
  };
};

/**
 * Hook pour récupérer les statistiques d'unstaking formatées pour la chart avec période personnalisée
 */
export const useUnstakingStatsForChartWithPeriod = (period: ChartPeriod = '7d'): UseUnstakingStatsWithChartResult => {
  const baseResult = useUnstakingStats();
  
  // Logique métier : traiter les données pour la chart selon la période
  const chartData = useMemo(() => {
    if (!baseResult.dailyStats.length) return [];

    // Déterminer le nombre de jours selon la période
    const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : period === '24h' ? 1 : period === '1y' ? baseResult.dailyStats.length : 7;
    
    // Prendre les N derniers jours et les formater (ou toutes les données pour 1y)
    return baseResult.dailyStats
      .slice(period === '1y' ? 0 : -days)
      .map((stat: UnstakingDailyStats) => {
        const date = new Date(stat.date);
        
        // Format différent selon la période
        let dayName;
        if (period === '1y') {
          // Pour All Time, afficher seulement le mois/année (MM/YY)
          dayName = date.toLocaleDateString('fr-FR', { 
            month: '2-digit', 
            year: '2-digit' 
          });
        } else {
          // Pour les autres périodes, garder le format original
          dayName = date.toLocaleDateString('fr-FR', { 
            weekday: 'short', 
            day: 'numeric', 
            month: 'short' 
          });
        }
        
        return {
          day: dayName,
          date: stat.date,
          totalTokens: stat.totalTokens,
          transactionCount: stat.transactionCount,
          uniqueUsers: stat.uniqueUsers
        };
      });
  }, [baseResult.dailyStats, period]);

  return {
    ...baseResult,
    chartData
  };
};

/**
 * Hook pour récupérer les statistiques d'unstaking formatées pour la chart avec nombre de jours personnalisé
 */
export const useUnstakingStatsForChartWithDays = (days: number = 10): UseUnstakingStatsWithChartResult => {
  const baseResult = useUnstakingStats();
  
  // Logique métier : traiter les données pour la chart selon le nombre de jours
  const chartData = useMemo(() => {
    if (!baseResult.dailyStats.length) return [];

    // Prendre les N derniers jours et les formater
    return baseResult.dailyStats
      .slice(-days)
      .map((stat: UnstakingDailyStats) => {
        const date = new Date(stat.date);
        
        // Format différent selon le nombre de jours
        let dayName;
        if (days > 60) {
          // Pour 60+ jours, afficher seulement le mois/année (MM/YY)
          dayName = date.toLocaleDateString('fr-FR', { 
            month: '2-digit', 
            year: '2-digit' 
          });
        } else if (days > 30) {
          // Pour 30-60 jours, afficher jour/mois (DD/MM)
          dayName = date.toLocaleDateString('fr-FR', { 
            day: '2-digit', 
            month: '2-digit' 
          });
        } else {
          // Pour ≤30 jours, garder le format original
          dayName = date.toLocaleDateString('fr-FR', { 
            weekday: 'short', 
            day: 'numeric', 
            month: 'short' 
          });
        }
        
        return {
          day: dayName,
          date: stat.date,
          totalTokens: stat.totalTokens,
          transactionCount: stat.transactionCount,
          uniqueUsers: stat.uniqueUsers
        };
      });
  }, [baseResult.dailyStats, days]);

  return {
    ...baseResult,
    chartData
  };
};

/**
 * Hook public pour récupérer les statistiques d'unstaking (incluant upcoming)
 */
export const useUnstakingStatsData = (): {
  dailyStats: UnstakingDailyStats[];
  totalStats: UnstakingTotalStats | null;
  upcomingUnstaking: UpcomingUnstakingStats | null;
  lastUpdate: number | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} => {
  return useUnstakingStats();
};

// Export des types pour l'utilisation externe
export type { UnstakingChartData, UseUnstakingStatsWithChartResult } from '../../types/staking'; 