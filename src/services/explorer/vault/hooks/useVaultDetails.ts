import { useMemo } from 'react';
import { useDataFetching } from '@/hooks/useDataFetching';
import { fetchVaultDetails } from '../api';
import { 
  VaultDetailsRequest,
  VaultDetailsResponse,
  VaultChartData,
  VaultChartTimeframe,
  UseVaultDetailsResult
} from '../types';

/**
 * Hook pour récupérer les détails d'un vault spécifique avec chart data
 * @param vaultAddress L'adresse du vault système
 * @param timeframe Le timeframe sélectionné
 * @returns Les données de chart et les contrôles
 */
export function useVaultDetails(
  vaultAddress: string,
  timeframe: VaultChartTimeframe = 'day'
): UseVaultDetailsResult {

  const { data, isLoading, error, refetch } = useDataFetching<VaultDetailsResponse>({
    fetchFn: async () => {
      const params: VaultDetailsRequest = {
        type: "vaultDetails",
        vaultAddress
      };
      return await fetchVaultDetails(params);
    },
    refreshInterval: 30000, // 30 secondes
    maxRetries: 3,
    dependencies: [vaultAddress], // Re-fetch si l'adresse change
    initialData: undefined
  });

  // Transformation des données pour la chart selon le timeframe sélectionné
  const chartData = useMemo((): VaultChartData[] => {
    if (!data?.portfolio) return [];

    // Trouver les données pour le timeframe sélectionné
    const portfolioEntry = data.portfolio.find(([period]) => period === timeframe);
    if (!portfolioEntry) return [];

    const [, historyData] = portfolioEntry;
    const { accountValueHistory, pnlHistory } = historyData;

    // Combiner les données d'account value et PnL
    const chartPoints: VaultChartData[] = [];
    
    // Utiliser accountValueHistory comme base (assume qu'il a le même nombre de points que pnlHistory)
    accountValueHistory.forEach(([timestamp, accountValueStr], index) => {
      const pnlEntry = pnlHistory[index];
      if (pnlEntry) {
        const [pnlTimestamp, pnlStr] = pnlEntry;
        
        // Vérifier que les timestamps correspondent (ils devraient)
        if (timestamp === pnlTimestamp) {
          chartPoints.push({
            timestamp,
            accountValue: parseFloat(accountValueStr),
            pnl: parseFloat(pnlStr),
            date: new Date(timestamp).toISOString()
          });
        }
      }
    });

    return chartPoints.sort((a, b) => a.timestamp - b.timestamp);
  }, [data, timeframe]);

  return {
    chartData,
    timeframe,
    isLoading,
    error,
    refetch
  };
} 